using Newtonsoft.Json;
using Yoma.Core.Domain.Core.Models;

namespace Yoma.Core.Domain.MyOpportunity.Models
{
    public abstract class MyOpportunitySearchFilterBase : PaginationFilter
    {
        public Action Action { get; set; }

        public VerificationStatus? VerificationStatus { get; set; }

        [JsonIgnore]
        public bool TotalCountOnly { get; set; }
    }
}