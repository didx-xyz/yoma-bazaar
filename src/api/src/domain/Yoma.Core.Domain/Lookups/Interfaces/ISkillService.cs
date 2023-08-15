﻿using Yoma.Core.Domain.Core.Models;
using Yoma.Core.Domain.Lookups.Models;

namespace Yoma.Core.Domain.Lookups.Interfaces
{
    public interface ISkillService
    {
        Skill GetByName(string name);

        Skill? GetByNameOrNull(string name);

        Skill GetById(Guid id);

        Skill? GetByIdOrNull(Guid id);

        SkillSearchResults Search(SkillSearchFilter filter);

        Task SeedSkills();
    }
}
