using Yoma.Core.Domain.MyOpportunity.Models;

namespace Yoma.Core.Domain.MyOpportunity.Interfaces
{
    public interface IMyOpportunityService
    {
        Task PerformActionViewed(Guid opportunityId);

        Task PerformActionSaved(Guid opportunityId);

        Task PerformActionSavedRemove(Guid opportunityId);

        Task PerformActionSendForVerification(Guid opportunityId, MyOpportunityVerifyRequest request);

        Task CompleteVerification(Guid userId, Guid opportunityId, VerificationStatus status);
    }
}
