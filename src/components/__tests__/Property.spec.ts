/* eslint no-magic-numbers: 0 */
import "../../__tests__/useHashFactory";

import * as rdf from "@ontologies/rdf";
import * as rdfs from "@ontologies/rdfs";
import * as schema from "@ontologies/schema";
import * as xsd from "@ontologies/xsd";
import { mount } from "enzyme";
import { ComponentRegistration, LinkedRenderStore } from "link-lib";
import React from "react";

import * as ctx from "../../__tests__/helpers/fixtures";
import ex from "../../ontology/ex";
import example from "../../ontology/example";
import ll from "../../ontology/ll";
import { register } from "../../register";
import { FC, PropertyProps } from "../../types";
import { Property } from "../Property";

const subject = example.ns("41");

describe("Property component", () => {
    const render = (props: object = {}, registrations: Array<ComponentRegistration<any>> = []) => {
        const opts = ctx.fullCW();
        opts.lrs.registerAll(registrations);

        return mount(opts.wrapComponent(React.createElement(
            Property,
            {
                forceRender: true,
                label: ex.ns("nonexistent"),
                ...opts.contextProps(),
                ...props,
            },
        )));
    };

    it("renders null when label and data are not present", () => {
        const elem = render({
            forceRender: false,
            label: undefined,
        });
        expect(elem.find(Property).children()).toHaveLength(0);
    });

    it("renders null when data is not present with forceRender", () => {
        const elem = render();
        expect(elem.find(Property).children()).toHaveLength(0);
    });

    it("renders the children when data is not present with forceRender and children", () => {
        const elem = render({ children: React.createElement("span", { className: "child-elem" }) });

        expect(elem).toContainMatchingElement(".child-elem");
    });

    it("renders the children and association renderer when data is not present with forceRender and children", () => {
        const regs = LinkedRenderStore.registerRenderer(
            ({ children }: any) => React.createElement("div", { className: "association" }, children),
            schema.CreativeWork,
            rdf.predicate,
        );
        const elem = render({ children: React.createElement("span", { className: "association-child" }) }, regs);

        expect(elem).toContainMatchingElement(".association");
        expect(elem).toContainMatchingElement(".association-child");
    });

    it("renders null when the given property is not present", () => {
        const opts = ctx.fullCW(subject);

        const comp = React.createElement(
            Property,
            { label: schema.title, ...opts.contextProps() },
        );
        const elem = mount(opts.wrapComponent(comp));

        expect(elem.find(Property).children()).toHaveLength(0);
    });

    it("renders the value when no view is registered", () => {
        const title = "The title";
        const opts = ctx.name(subject, title);

        const comp = React.createElement(
            Property,
            { label: schema.name, ...opts.contextProps() },
        );
        const elem = mount(opts.wrapComponent(comp));

        expect(elem.find("div").last()).toHaveText(title);
    });

    it("renders the view", () => {
        const title = "The title";
        const opts = ctx.name(subject, title);
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
            () => React.createElement("div", { className: "nameProp" }),
            schema.Thing,
            schema.name,
        ));

        const comp = React.createElement(
            Property,
            { label: schema.name, ...opts.contextProps() },
        );
        const elem = mount(opts.wrapComponent(comp));

        expect(elem.find(Property).children()).toHaveLength(1);
        expect(elem.find(".nameProp")).toExist();
    });

    it("renders a LRC when rendering a NamedNode", () => {
        const opts = ctx.fullCW(subject);
        opts.lrs.registerAll(
            LinkedRenderStore.registerRenderer(
                () => React.createElement("p", null, "loading"),
                ll.LoadingResource,
            ),
        );

        const comp = React.createElement(
            Property,
            { label: schema.author, ...opts.contextProps() },
        );
        const elem = mount(opts.wrapComponent(comp));

        expect(elem.find("Property")).toHaveText("loading");
    });

    it("renders the literal renderer", () => {
        const opts = ctx.fullCW();
        const component: FC<PropertyProps> = ({ linkedProp }) => {
          return React.createElement(
            "div",
            { className: "integerRenderer", children: linkedProp.value },
          );
        };
        component.type = rdfs.Literal;
        component.property = xsd.integer;

        opts.lrs.registerAll(register(component));

        const comp = React.createElement(
            Property,
            { label: ex.ns("timesRead"), ...opts.contextProps() },
        );
        const elem = mount(opts.wrapComponent(comp));

        expect(elem).toContainMatchingElement(".integerRenderer");
        expect(elem.find(".integerRenderer")).toHaveText("5");
    });

    describe("limit", () => {
        it("renders two components", () => {
            const opts = ctx.fullCW(subject);
            const comp = React.createElement(
                Property,
                { label: example.ns("tags"), limit: 2, ...opts.contextProps() },
            );

            const elem = mount(opts.wrapComponent(comp));

            expect(elem.find(Property).find("Resource")).toHaveLength(2);
        });

        it("renders all components", () => {
            const opts = ctx.fullCW(subject);
            const comp = React.createElement(
                Property,
                { label: example.ns("tags"), limit: Infinity, ...opts.contextProps() },
            );

            const elem = mount(opts.wrapComponent(comp));

            expect(elem.find(Property).find("Resource")).toHaveLength(4);
        });
    });

    describe("with children", () => {
        const title = "The title";
        const renderWithChildren = (registrations: Array<ComponentRegistration<any>> = []) => {
            const opts = ctx.name(subject, title);

            const comp = React.createElement(
                Property,
                { forceRender: true, label: schema.name, ...opts.contextProps() },
                React.createElement("p", { className: "childComponent" }, null),
            );
            opts.lrs.registerAll(registrations);

            return mount(opts.wrapComponent(comp));
        };

        it("renders the children", () => {
            const elem = renderWithChildren();

            expect(elem.find("p.childComponent")).toExist();
        });

        it("renders the children when a component was found", () => {
            const regs = LinkedRenderStore.registerRenderer(
                (props: any) => React.createElement("div", { className: "nameProp" }, props.children),
                schema.Thing,
                schema.name,
            );
            const elem = renderWithChildren(regs);

            expect(elem.find("p.childComponent")).toExist();
        });
    });
});
