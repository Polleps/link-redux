/* eslint no-magic-numbers: 0 */
import "../../__tests__/useHashFactory";

import rdfFactory from "@ontologies/core";
import * as rdfx from "@ontologies/rdf";
import * as schema from "@ontologies/schema";
import { mount } from "enzyme";
import { LinkedRenderStore, RENDER_CLASS_NAME } from "link-lib";
import React from "react";

import * as ctx from "../../__tests__/helpers/fixtures";
import ex from "../../ontology/ex";
import example from "../../ontology/example";
import ll from "../../ontology/ll";
import { Resource } from "../Resource";

const id = "resources/5";
const iri = example.ns(id);

const createTestElement = (className = "testComponent") => () => React.createElement(
    "span",
    { className },
);
const loadLinkedObject = () => undefined;

describe("Resource component", () => {
    it("renders null when type is not present", () => {
        const opts = ctx.empty(iri);
        const comp = React.createElement(Resource, {
            className: "testmarker",
            loadLinkedObject,
            subject: iri,
        });

        const elem = mount(opts.wrapComponent(comp));

        expect(elem.find("Resource.testmarker").children())
            .toHaveLength(0);
    });

    it("loads the reference when no data is present", () => {
        const spy = jest.fn();
        const opts = ctx.empty();
        opts.lrs.queueEntity = spy;

        mount(opts.wrapComponent());

        expect(spy).toHaveBeenCalledTimes(1);
    });

    it("does not load the reference when data is present", () => {
        const spy = jest.fn();
        const opts = ctx.fullCW(iri);
        opts.lrs.getEntity = spy;
        const comp = React.createElement(
            Resource,
            opts.contextProps(),
        );

        mount(opts.wrapComponent(comp));

        expect(spy).not.toHaveBeenCalled();
    });

    it("renders the renderer when an subject is present", () => {
        const opts = ctx.fullCW(iri);

        const comp = createTestElement();
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(comp, schema.Thing));

        const elem = mount(opts.wrapComponent());

        expect(elem.find(Resource)).toExist();
        expect(elem.find("span.testComponent")).toHaveLength(1);
    });

    it("renders blank nodes", () => {
        const bn = rdfFactory.blankNode();
        const opts = ctx.chargeLRS(
            [
                rdfFactory.quadruple(bn, rdfx.type, schema.Thing),
                rdfFactory.quadruple(bn, schema.name, rdfFactory.literal("title")),
            ],
            bn,
        );

        const comp = createTestElement();
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(comp, schema.Thing));
        const elem = mount(
            opts.wrapComponent(React.createElement(Resource, {
                loadLinkedObject,
                subject: bn,
            })),
        );

        expect(elem.find("span.testComponent")).toExist();
    });

    it("renders error component when mounting unfetched blank node", () => {
        const bn = rdfFactory.blankNode();
        const opts = ctx.chargeLRS(
            [],
            bn,
        );

        opts.lrs.registerAll(
          LinkedRenderStore.registerRenderer(createTestElement(), schema.Thing),
          LinkedRenderStore.registerRenderer(createTestElement("error"), ll.ErrorResource),
        );
        const elem = mount(
            opts.wrapComponent(React.createElement(Resource, {
              loadLinkedObject,
              subject: bn,
            })),
        );

        expect(elem.find("span.error")).toExist();
    });

    it("renders children when present", () => {
        const opts = ctx.fullCW(iri);
        const loc = React.createElement(
            Resource,
            { loadLinkedObject, subject: iri },
            React.createElement("span", null, "override"),
        );
        const elem = mount(opts.wrapComponent(loc));

        expect(elem.find("span").last()).toHaveText("override");
    });

    const renderThroughOpts = () => {
      const opts = ctx.multipleCW(iri, { second: { id: example.ns("resources/10") } });

      opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
        createTestElement("normalRendered"),
        schema.CreativeWork,
      ));
      opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
        createTestElement("collectionRendered"),
        schema.CreativeWork,
        RENDER_CLASS_NAME,
        ex.ns("collection"),
      ));

      return opts;
    };

    it("renders correct topology through children", () => {
        const opts = renderThroughOpts();

        const comp = React.createElement(
            Resource,
            { loadLinkedObject, subject: iri, topology: ex.ns("collection") },
            React.createElement(
                Resource,
                { loadLinkedObject, subject: iri },
                React.createElement(
                    Resource,
                    { loadLinkedObject, subject: example.ns("resources/10") },
                ),
            ),
        );

        const elem = mount(opts.wrapComponent(comp));

        expect(elem.find("span").last()).toHaveClassName("collectionRendered");
    });

    it("renders default topology through children", () => {
        const opts = renderThroughOpts();

        const comp = React.createElement(
            Resource,
            { loadLinkedObject, subject: iri },
            React.createElement
            (Resource,
                { loadLinkedObject, subject: iri },
                React.createElement(
                    Resource,
                    { loadLinkedObject, subject: example.ns("resources/10") },
                ),
            ),
        );

        const elem = mount(opts.wrapComponent(comp));

        expect(elem.find("span").last()).toHaveClassName("normalRendered");
    });
});
