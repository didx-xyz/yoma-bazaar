﻿using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Yoma.Core.Domain.Core.Interfaces;
using Yoma.Core.Domain.Core.Models;
using Yoma.Core.Domain.Lookups.Interfaces;
using Yoma.Core.Domain.Lookups.Models;

namespace Yoma.Core.Domain.Lookups.Services
{
    public class CountryService : ICountryService
    {
        #region Class Variables
        private readonly AppSettings _appSettings;
        private readonly IMemoryCache _memoryCache;
        private readonly IRepository<Country> _countryRepository;
        #endregion

        #region Constructor
        public CountryService(IOptions<AppSettings> appSettings,
            IMemoryCache memoryCache,
            IRepository<Country> countryRepository)
        {
            _appSettings = appSettings.Value;
            _memoryCache = memoryCache;
            _countryRepository = countryRepository;
        }
        #endregion

        #region Public Members
        public Country GetByName(string name)
        {
            var result = GetByNameOrNull(name);

            if (result == null)
                throw new ArgumentException($"{nameof(Gender)} with name '{name}' does not exists", nameof(name));

            return result;
        }

        public Country? GetByNameOrNull(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentNullException(nameof(name));
            name = name.Trim();

            return List().SingleOrDefault(o => o.Name == name);
        }

        public Country GetByCodeAplha2(string code)
        {
            var result = GetByCodeAplha2OrNull(code);

            if (result == null)
                throw new ArgumentException($"{nameof(Gender)} with code '{code}' does not exists", nameof(code));

            return result;
        }

        public Country? GetByCodeAplha2OrNull(string code)
        {
            if (string.IsNullOrWhiteSpace(code))
                throw new ArgumentNullException(nameof(code));
            code = code.Trim();

            return List().SingleOrDefault(o => o.Name == code);
        }

        public Country GetById(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentNullException(nameof(id));

            var result = List().SingleOrDefault(o => o.Id == id);

            if (result == null)
                throw new ArgumentException($"{nameof(Gender)} for '{id}' does not exists", nameof(id));

            return result;
        }

        public List<Country> List()
        {
            if (!_appSettings.CacheEnabledByReferenceDataTypes.HasFlag(Core.ReferenceDataType.Lookups))
                return _countryRepository.Query().ToList();

            var result = _memoryCache.GetOrCreate(nameof(Country), entry =>
            {
                entry.SlidingExpiration = TimeSpan.FromHours(_appSettings.CacheSlidingExpirationLookupInHours);
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(_appSettings.CacheAbsoluteExpirationRelativeToNowLookupInDays);
                return _countryRepository.Query().ToList();
            });

            if (result == null)
                throw new InvalidOperationException($"Failed to retrieve cached list of '{nameof(Country)}'s");

            return result;
        }
        #endregion
    }
}