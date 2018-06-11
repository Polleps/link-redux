import { LazyNNArgument, LinkedRenderStore, SomeNode } from "link-lib";
import { BlankNode, Literal, NamedNode } from "rdflib";
import { ComponentType, ReactType } from "react";
import { Action } from "redux";

/****** Types & Composite types ******/

export type LabelType = NamedNode | NamedNode[];

export type LinkAction = LinkFetchAction | LinkGetAction | LinkReloadAction;

export type LoadLinkedObject = (href: NamedNode, fetch: boolean) => LinkAction;

export type LinkedPropType = NamedNode | BlankNode | Literal;

export type LinkReduxLRSType = LinkedRenderStore<ReactType>;

export type LinkReturnType = "term" | "statement" | "value";

export type LinkStateTree = LinkStateTreeObj | LinkStateTreeMap;

export type LinkStateTreeMap = Map<string, { [k: string]: string }>;

export type MapDataToPropsParam = MapDataToPropsParamObject | NamedNode[];

export type RegisterableComponent<P> = ComponentType<P> & RegistrationOpts;

export type ReloadLinkedObject = (href: NamedNode, fetch: boolean) => LinkAction;

export type SubjectType = SomeNode;

export type TopologyType = NamedNode | undefined | null;

/****** Others ******/

export interface LinkContext {
    subject: SubjectType;
    topology: TopologyType;
}

export interface LinkFetchPayload {
    href: NamedNode;
    linkedObjectAction: true;
}

export interface LinkFetchAction extends Action<"FETCH_LINKED_OBJECT"> {
    payload: LinkFetchPayload;
}

export interface LinkGetPayload {
    iri: NamedNode;
    linkedObjectAction: true;
}

export interface LinkGetAction extends Action<"GET_LINKED_OBJECT"> {
    payload: LinkGetPayload;
}

export interface LinkModelTouchAction extends Action<"LINKED_MODEL_TOUCH"> {
    payload: LinkStateTreeSlice;
}

export interface LinkOpts {
    forceRender?: boolean;
    label?: LabelType;
    limit?: number;
    linkedProp?: LinkedPropType;
    name?: string;
    returnType?: LinkReturnType;
}

export interface LinkReloadAction extends Action<"RELOAD_LINKED_OBJECT"> {
    payload: LinkFetchPayload;
}

export interface LinkStateTreeSlice {
    [k: string]: string;
}

export interface LinkStateTreeObj {
    linkedObjects: LinkStateTreeSlice;
}

export interface MapDataToPropsParamObject {
    [k: string]: NamedNode | NamedNode[] | LinkOpts;
}

export interface RegistrationOpts {
    type: LazyNNArgument;
    mapDataToProps?: MapDataToPropsParam;
    linkOpts?: LinkOpts;
    property?: LazyNNArgument;
    topology?: LazyNNArgument | Array<NamedNode | undefined>;
}

export interface URLConverter {
    convert: (iri: string) => string;
    match: string | RegExp;
}

export interface URLConverterSet {
    [k: string]: URLConverter;
}

export interface SubjectProp {
    subject: SubjectType;
}

export interface TopologyProp {
    topology: TopologyType;
}

export interface VersionProp {
    version: string;
}

export interface PropertyProps extends SubjectProp, VersionProp {}
