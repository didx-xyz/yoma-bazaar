﻿namespace Yoma.Core.Domain.Core.Models
{
    public class AppSettings
    {
        public AppSettingsCredentials AdminKeyCloak { get; set; }

        public AppSettingsCredentials WebhookAdminKeyCloak { get; set; }

        public string SwaggerScopes { get; set; }

        public int CacheSlidingExpirationLookupInHours { get; set; }

        public int CacheAbsoluteExpirationRelativeToNowLookupInDays { get; set; }

        public ReferenceDataType CacheEnabledByReferenceDataTypes { get; set; }
    }

    public class AppSettingsCredentials
    {
        public string Username { get; set; }

        public string Password { get; set; }
    }
}