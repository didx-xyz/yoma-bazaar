using Newtonsoft.Json;

namespace Yoma.Core.Infrastructure.Bitly.Models
{
  public class BitLinkRequestCreate
  {
    [JsonProperty("long_url")]
    public string LongURL { get; set; }

    [JsonProperty("domain", NullValueHandling = NullValueHandling.Ignore)]
    public string? Domain { get; set; }

    [JsonProperty("group_guid")]
    public string? GroupId { get; set; }

    [JsonProperty("title")]
    public string Title { get; set; }

    [JsonProperty("tags", NullValueHandling = NullValueHandling.Ignore)]
    public List<string>? Tags { get; set; }

    public static implicit operator BitLinkRequestCreate(BitLinkResponse v)
    {
      throw new NotImplementedException();
    }
  }
}
