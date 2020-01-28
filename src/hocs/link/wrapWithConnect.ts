import { Quad } from "@ontologies/core";
import hoistNonReactStatics from "hoist-non-react-statics";
import React from "react";

import { PropertyWrappedProps } from "../../components/Property";
import { id } from "../../factoryHelpers";
import { useCalculateChildProps } from "../../hooks/useCalculateChildProps";
import { useDataInvalidation } from "../../hooks/useDataInvalidation";
import { useLinkedObjectProperties } from "../../hooks/useLinkedObjectProperties";
import { useLinkRenderContext } from "../../hooks/useLinkRenderContext";
import { useLRS } from "../../hooks/useLRS";
import { LinkOpts, ReturnType } from "../../types";

import { DataToPropsMapping } from "./dataPropsToPropMap";

export const wrapWithConnect = <P>(
    propMap: DataToPropsMapping,
    requestedProperties: number[],
    opts: LinkOpts,
) => (wrappedComponent: React.ComponentType<P>): React.ComponentType<any> => {
    const comp = React.forwardRef((props: P & PropertyWrappedProps, ref: unknown) => {
        const lrs = useLRS();
        const context = useLinkRenderContext();
        const childProps = useCalculateChildProps({ ...props, innerRef: ref}, context, { lrs: true });
        const subjectData = lrs.tryEntity(childProps.subject);

        const subjProps: Quad[] = [];
        for (let i = 0; i < subjectData.length; i++) {
          if (requestedProperties.includes(id(subjectData[i].predicate))) {
            subjProps.push(subjectData[i]);
          }
        }
        const mappedProps = {
            ...childProps,
            ...useLinkedObjectProperties(subjProps, propMap, opts.returnType || ReturnType.Term),
        };

        const linkVersion = useDataInvalidation(mappedProps);

        if ((props.forceRender || opts.forceRender) !== true && subjProps.length === 0) {
            return null;
        }

        return React.createElement(
            wrappedComponent,
            {
                ...mappedProps,
                linkVersion,
            },
        );
    });
    comp.displayName = `linkMapDataToProps(${comp.displayName || comp.name})`;

    return hoistNonReactStatics(comp, wrappedComponent);
};
