﻿using SendGrid;
using SendGrid.Helpers.Mail;
using Yoma.Core.Domain.Core.Interfaces;
using Yoma.Core.Domain.EmailProvider;
using Yoma.Core.Domain.EmailProvider.Models;
using Yoma.Core.Infrastructure.SendGrid.Models;
using Yoma.Core.Domain.Core.Extensions;
using Newtonsoft.Json;
using SendGrid.Helpers.Errors.Model;
using Yoma.Core.Domain.Core.Exceptions;
using Yoma.Core.Domain.EmailProvider.Interfaces;

namespace Yoma.Core.Infrastructure.SendGrid.Client
{
    public class SendGridClient : IEmailProviderClient
    {
        #region Class Variables
        private readonly IEnvironmentProvider _environmentProvider;
        private readonly SendGridOptions _options;
        private readonly ISendGridClient _sendGridClient;
        #endregion

        #region Constructor
        public SendGridClient(IEnvironmentProvider environmentProvider, SendGridOptions options, ISendGridClient sendGridClient)
        {
            _environmentProvider = environmentProvider;
            _options = options;
            _sendGridClient = sendGridClient;
        }
        #endregion

        #region Public Members
        public async Task Send<T>(EmailType type, List<EmailRecipient> recipients, T data)
            where T : EmailDataBase
        {
            if (recipients == null || !recipients.Any())
                throw new ArgumentNullException(nameof(recipients));

            if (data == null)
                throw new ArgumentNullException(nameof(data));

            if (!_options.Templates.ContainsKey(type.ToString()))
                throw new ArgumentException($"Email template id for type '{type}' not configured", nameof(type));

            //ensure environment suffix
            data.SubjectSuffix = _environmentProvider.Environment == Domain.Core.Environment.Production ? string.Empty : $" ({_environmentProvider.Environment.ToDescription()})";

            var msg = new SendGridMessage
            {
                TemplateId = _options.Templates[type.ToString()],
                From = new EmailAddress(_options.From.Name, _options.From.Email),
                Personalizations = ProcessRecipients(recipients, data)
            };

            if (_options.ReplyTo != null) msg.ReplyTo = new EmailAddress(_options.ReplyTo.Name, _options.ReplyTo.Email);

            var response = await _sendGridClient.SendEmailAsync(msg);
            if (response.IsSuccessStatusCode) return;

            string responseBody = await response.Body.ReadAsStringAsync();
            var errorResponse = JsonConvert.DeserializeObject<SendGridErrorResponse>(responseBody)
                ?? throw new HttpClientException(response.StatusCode, "Failed to send email: Reason unknown");

            throw new HttpClientException(response.StatusCode, $"{errorResponse.ErrorReasonPhrase}: {errorResponse.SendGridErrorMessage}");
        }
        #endregion

        #region Private Members
        private static List<Personalization> ProcessRecipients<T>(List<EmailRecipient> recipients, T data)
            where T : EmailDataBase
        {
            var result = new List<Personalization>();

            foreach (var recipient in recipients)
            {
                var item = new Personalization
                {
                    Tos = new List<EmailAddress>(),
                    TemplateData = data
                };

                item.Tos.Add(new EmailAddress(recipient.DisplayName, recipient.Email));
                result.Add(item);
            }

            return result;
        }
        #endregion
    }
}