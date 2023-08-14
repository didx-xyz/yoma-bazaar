﻿using Flurl.Http;
using Yoma.Core.Domain.Emsi.Interfaces;
using Yoma.Core.Domain.Emsi.Models;
using Yoma.Core.Infrastructure.Emsi.Models;
using Yoma.Core.Domain.Core.Extensions;
using Flurl;

namespace Yoma.Core.Infrastructure.Emsi.Client
{
    public class EmsiClient : IEmsiClient
    {
        #region Class Variables
        private readonly EmsiOptions _options;
        private OAuthResponse _accessToken;

        private const string Header_Authorization = "Authorization";
        private const string Header_Authorization_Value_Prefix = "Bearer";
        #endregion

        #region Constructor
        public EmsiClient(EmsiOptions options)
        {
            _options = options;
        }
        #endregion

        #region Public Members
        public async Task<List<Domain.Emsi.Models.Skill>?> ListSkills()
        {
            var resp = await _options.BaseUrl
               .AppendPathSegment($"/skills/versions/latest/skills")
               .WithAuthHeaders(await GetAuthHeaders(AuthScope.Skills))
               .GetAsync()
               .EnsureSuccessStatusCodeAsync();

            var results = await resp.GetJsonAsync<SkillResponse>();

            return results?.data.Select(o => new Domain.Emsi.Models.Skill { Id = o.id, Name = o.name, InfoURL = o.infoUrl }).ToList();
        }

        public async Task<List<JobTitle>?> ListJobTitles()
        {
            var resp = await _options.BaseUrl
               .AppendPathSegment($"/titles/versions/latest/titles")
               .WithAuthHeaders(await GetAuthHeaders(AuthScope.Jobs))
               .GetAsync()
               .EnsureSuccessStatusCodeAsync();

            var results = await resp.GetJsonAsync<TitleResponse>();

            return results?.data?.Select(o => new JobTitle { Id = o.id, Name = o.name }).ToList();
        }
        #endregion

        #region Private Members
        private async Task<KeyValuePair<string, string>> GetAuthHeaders(AuthScope scope)
        {
            if (_accessToken != null && _accessToken.DateExpire > DateTimeOffset.Now)
                return new KeyValuePair<string, string>(Header_Authorization, $"{Header_Authorization_Value_Prefix} {_accessToken.access_token}");

            var data = new Dictionary<string, string>
            {
                { "client_id", _options.ClientId },
                {"client_secret", _options.ClientSecret },
                { "grant_type", "client_credentials"},
                {"scope", scope.ToDescription() }
            };

            _accessToken = await _options.AuthUrl
               .PostUrlEncodedAsync(data)
               .EnsureSuccessStatusCodeAsync()
               .ReceiveJson<OAuthResponse>();

            return new KeyValuePair<string, string>(Header_Authorization, $"{Header_Authorization_Value_Prefix} {_accessToken.access_token}");
        }
        #endregion
    }
}
