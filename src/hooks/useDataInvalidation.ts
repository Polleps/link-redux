import rdfFactory, { doc, Node, TermType } from "@ontologies/core";
import { equals, id, normalizeType } from "link-lib";
import React from "react";

import { reduceDataSubjects } from "../helpers";
import { DataInvalidationProps, LaxNode, SubjectType } from "../types";

import { useLRS } from "./useLRS";

/**
 * The subjects this component subscribes to.
 * Includes the subject by default.
 */
export function normalizeDataSubjects(props: Partial<DataInvalidationProps>): SubjectType[] {
    if (!(props.subject || props.dataSubjects)) {
        return [];
    }

    const result = [];
    if (props.subject) {
      result.push(props.subject);
    }
    if (props.dataSubjects) {
        result.push(...normalizeType(props.dataSubjects));
    }

    if (props.subject?.termType === TermType.NamedNode) {
        const document = rdfFactory.namedNode(doc(props.subject));
        if (!equals(document, props.subject)) {
            result.push(document);
        }
    }

    return result;
}

/**
 * Re-renders when one of the given {resources} changes in the store.
 */
export function useDataInvalidation(subjects: LaxNode | LaxNode[]): number {
    const resources = normalizeType(subjects!).filter<Node>(Boolean as any);
    const lrs = useLRS();
    const subId = resources.length > 0 ? id(lrs.store.canon(resources[0])) : undefined;
    const [lastUpdate, setInvalidate] = React.useState<number>(
        subId ? (lrs as any).store.changeTimestamps[subId] : 0,
    );

    function handleStatusChange(_: unknown, lastUpdateAt?: number) {
        setInvalidate(lastUpdateAt!);
    }

    React.useEffect(() => {
        return lrs.subscribe({
            callback: handleStatusChange,
            lastUpdateAt: undefined,
            markedForDelete: false,
            onlySubjects: true,
            subjectFilter: resources,
        });
    }, [
      subId,
      reduceDataSubjects(resources),
    ]);

    return lastUpdate;
}
