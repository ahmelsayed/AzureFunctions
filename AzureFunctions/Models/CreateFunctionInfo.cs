﻿using Newtonsoft.Json;

namespace AzureFunctions.Models
{
    public class CreateFunctionInfo
    {
        [JsonProperty(PropertyName = "templateId")]
        public string TemplateId { get; set; }

        [JsonProperty(PropertyName = "name")]
        public string Name { get; set; }

        [JsonProperty(PropertyName = "containerScmUrl")]
        public string ContainerScmUrl { get; set; }
    }
}