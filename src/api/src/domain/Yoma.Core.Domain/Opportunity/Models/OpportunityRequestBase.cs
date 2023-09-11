using System.ComponentModel.DataAnnotations;

namespace Yoma.Core.Domain.Opportunity.Models
{
    public abstract class OpportunityRequestBase
    {
        [Required]
        public string Title { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        public Guid TypeId { get; set; }

        [Required]
        public Guid OrganizationId { get; set; }

        public string? Instructions { get; set; }

        public string? URL { get; set; }

        public decimal? ZltoReward { get; set; }

        public decimal? YomaReward { get; set; }

        public decimal? ZltoRewardPool { get; set; }

        public decimal? YomaRewardPool { get; set; }

        [Required]
        public bool VerificationSupported { get; set; }

        [Required]
        public bool SSIIntegrated { get; set; }

        [Required]
        public Guid DifficultyId { get; set; }

        [Required]
        public Guid CommitmentIntervalId { get; set; }

        public short? CommitmentIntervalCount { get; set; }

        public int? ParticipantLimit { get; set; }

        public List<string>? Keywords { get; set; }

        [Required]
        public DateTimeOffset DateStart { get; set; }

        public DateTimeOffset? DateEnd { get; set; }

        [Required]
        public List<Guid> Categories { get; set; }

        [Required]
        public List<Guid> Countries { get; set; }

        [Required]
        public List<Guid> Languages { get; set; }

        [Required]
        public List<Guid> Skills { get; set; }

        public Dictionary<VerificationType, string?>? VerificationTypes { get; set; }
    }
}
