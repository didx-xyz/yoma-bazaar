﻿using Yoma.Core.Domain.Core.Interfaces;
using Yoma.Core.Infrastructure.Database.Context;
using Yoma.Core.Infrastructure.Database.Core.Repositories;
using Yoma.Core.Infrastructure.Database.Entity.Entities;

namespace Yoma.Core.Infrastructure.Database.Entity.Repositories
{
    public class UserSkillRepository : BaseRepository<UserSkill>, IRepository<Domain.Entity.Models.UserSkill>
    {
        #region Constructor
        public UserSkillRepository(ApplicationDbContext context) : base(context) { }
        #endregion

        #region Public Members
        public IQueryable<Domain.Entity.Models.UserSkill> Query()
        {
            return _context.UserSkills.Select(entity => new Domain.Entity.Models.UserSkill
            {
                Id = entity.Id,
                UserId = entity.UserId, 
                SkillId = entity.SkillId,
                Skill = entity.Skill.Name,
                DateCreated = entity.DateCreated
            });
        }

        public async Task<Domain.Entity.Models.UserSkill> Create(Domain.Entity.Models.UserSkill item)
        {
            item.DateCreated = DateTimeOffset.Now;
      
            var entity = new UserSkill
            {
                Id = item.Id,
                UserId = item.UserId,
                SkillId = item.SkillId,
                DateCreated = item.DateCreated,
             
            };

            _context.UserSkills.Add(entity);
            await _context.SaveChangesAsync();
            item.Id = entity.Id;

            return item;
        }

        public Task Update(Domain.Entity.Models.UserSkill item)
        {
            throw new NotImplementedException();
        }

        public async Task Delete(Domain.Entity.Models.UserSkill item)
        {
            var entity = _context.UserSkills.Where(o => o.Id == item.Id).SingleOrDefault();

            if (entity == null)
                throw new ArgumentOutOfRangeException(nameof(item), $"UserSkills with id '{item.Id}' does not exist");

            _context.UserSkills.Remove(entity);
            await _context.SaveChangesAsync();
        }
        #endregion
    }
}