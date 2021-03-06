﻿export enum BindingType {
    timerTrigger = <any>"timerTrigger",
    eventHubTrigger = <any>"eventHubTrigger",
    eventHub = <any>"eventHub",
    queue = <any>"queue",
    queueTrigger = <any>"queueTrigger",
    blob = <any>"blob",
    blobTrigger = <any>"blobTrigger",
    httpTrigger = <any>"httpTrigger",
    http = <any>"http",
    table = <any>"table",
    serviceBus = <any>"serviceBus",
    serviceBusTrigger = <any>"serviceBusTrigger",
    manualTrigger = <any>"manualTrigger",
    documentdb = <any>"documentdb"
}

export interface BindingConfig {
    $shcema: string,
    contentVersion: string,
    variables: any,
    bindings: Binding[];
}


export interface Binding {
    type: BindingType;
    displayName: string;
    direction: DirectionType;
    defaultParameterName?: string;
    parameterNamePrompt?: string;
    settings: Setting[];
}

export interface Setting {
    name: string;
    value: SettingType;
    resource?: ResourceType;
    required?: boolean;
    label: string;
    defaultValue?: any;
    help?: string;
    enum?: EnumOption[];
}

export interface EnumOption {
    value: string;
    display: string;
} 

export enum DirectionType {
    trigger = <any>"trigger",
    in = <any>"in",
    out = <any>"out"
}

export enum ResourceType {
    Storage = <any>"Storage",
    EventHub = <any>"EventHub"    
}

export enum SettingType {
    string = <any>"string",
    boolean = <any>"boolean",
    label = <any>"label",
    enum = <any>"enum",
    int = <any>"int",
    picker = <any>"picker"
}

export interface UIFunctionConfig {
    schema: string;
    version: string;
    bindings: UIFunctionBinding[];
    originalConfig: any;
}

export interface FunctionSetting {
    name: string;
    value: any;
}

export interface FunctionBindingBase {
    type: BindingType;
    direction: DirectionType;
}

export interface UIFunctionBinding extends FunctionBindingBase {
    id: string;
    name: string;
    title?: string;
    settings: FunctionSetting[];
    hiddenList?: string[];
}
