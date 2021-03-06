﻿using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;

namespace AzureFunctions.Models
{
    public class PassthroughInfo
    {
        [JsonProperty(PropertyName = "httpMethod")]
        public string HttpMethod { get; set; }

        [JsonProperty(PropertyName = "requestBody")]
        public JToken RequestBody { get; set; }

        [JsonProperty(PropertyName = "url")]
        public string Url { get; set; }

        [JsonProperty(PropertyName = "queryString")]
        public string QueryString { get; set; }

        [JsonProperty(PropertyName = "headers")]
        public Dictionary<string, string> Headers { get; set; }

        [JsonProperty(PropertyName = "mediaType")]
        public string MediaType { get; set; }
    }
}