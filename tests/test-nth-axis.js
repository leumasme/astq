import * as chai from "chai";
const expect = chai.expect;
chai.config.includeStack = true;

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { default: ASTQ } = require("../dist/astq.cjs");
const ASTY = require("asty");

describe("ASTq nth() Function with ASTY", function () {
    let astq, parent, child1, child2, child3;

    beforeEach(function () {
        // Create a test AST similar to the existing tests but with named axes
        const asty = new ASTY();

        // Create a parent node with multiple children on different axes
        parent = asty.create("Parent");
        child1 = asty.create("Child1");
        child2 = asty.create("Child2");
        child3 = asty.create("Child3");

        // Add children to parent
        parent.add(child1);
        parent.add(child2);
        parent.add(child3);

        astq = new ASTQ();
    });

    it("should find first child using nth(1) on * axis", function () {
        const result = astq.query(parent, `/ * [ nth(1) ]`);
        
        expect(result).to.have.length(1);
        expect(result[0].type()).to.equal("Child1");
    });

    it("should find second child using nth(2) on * axis", function () {
        const result = astq.query(parent, `/ * [ nth(2) ]`);
        
        expect(result).to.have.length(1);
        expect(result[0].type()).to.equal("Child2");
    });

    it("should have consistent results between nth() and pos() functions", function () {
        const result1 = astq.query(parent, `/ * [ nth(1) ]`);
        const result2 = astq.query(parent, `/ * [ pos() == 1 ]`);
        
        expect(result1).to.have.length(1);
        expect(result2).to.have.length(1);
        expect(result1[0].type()).to.equal(result2[0].type());
        expect(result1[0].type()).to.equal("Child1");
    });

    it("should find third child using nth(3) on * axis", function () {
        const result = astq.query(parent, `/ * [ nth(3) ]`);
        
        expect(result).to.have.length(1);
        expect(result[0].type()).to.equal("Child3");
    });

    it("should return empty result for nth() beyond available children", function () {
        const result = astq.query(parent, `/ * [ nth(4) ]`);
        
        expect(result).to.have.length(0);
    });
});