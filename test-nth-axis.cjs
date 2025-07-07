#!/usr/bin/env node

const { default: ASTQ } = require("./dist/astq.cjs");
const ASTY = require("asty");

// Create a test AST similar to the existing tests but with named axes
const asty = new ASTY();

// Create a parent node with multiple children on different axes
const parent = asty.create("Parent");
const child1 = asty.create("Child1");
const child2 = asty.create("Child2");
const child3 = asty.create("Child3");

// Add children to parent
parent.add(child1);
parent.add(child2);
parent.add(child3);

console.log("Test AST structure:");
console.log("Parent");
console.log("  Child1 (position 1 on * axis)");
console.log("  Child2 (position 2 on * axis)");
console.log("  Child3 (position 3 on * axis)");
console.log("");

const astq = new ASTQ();

// Test basic nth functionality
console.log("Testing nth(1) on * axis...");
try {
    const result = astq.query(parent, `
        / * [
            nth(1)
        ]
    `);
    
    console.log("Query result:", result);
    console.log("Result length:", result.length);
    
    if (result.length === 1 && result[0].type() === "Child1") {
        console.log("✅ SUCCESS: nth(1) correctly found the 1st child on * axis");
    } else {
        console.log("❌ FAILED: nth(1) did not find the expected result");
    }
} catch (error) {
    console.log("❌ ERROR:", error.message);
}

console.log("");

// Test nth(2)
console.log("Testing nth(2) on * axis...");
try {
    const result = astq.query(parent, `
        / * [
            nth(2)
        ]
    `);
    
    console.log("Query result:", result);
    console.log("Result length:", result.length);
    
    if (result.length === 1 && result[0].type() === "Child2") {
        console.log("✅ SUCCESS: nth(2) correctly found the 2nd child on * axis");
    } else {
        console.log("❌ FAILED: nth(2) did not find the expected result");
    }
} catch (error) {
    console.log("❌ ERROR:", error.message);
}

console.log("");

// Test that the axis context is properly passed to functions
console.log("Testing that axis context is preserved...");
try {
    // This should work the same as before since we're using * axis
    const result1 = astq.query(parent, `/ * [ nth(1) ]`);
    const result2 = astq.query(parent, `/ * [ pos() == 1 ]`);
    
    if (result1.length === 1 && result2.length === 1 && 
        result1[0].type() === result2[0].type()) {
        console.log("✅ SUCCESS: nth() and pos() give consistent results");
    } else {
        console.log("❌ FAILED: nth() and pos() give inconsistent results");
        console.log("nth(1) result:", result1.map(n => n.type()));
        console.log("pos() == 1 result:", result2.map(n => n.type()));
    }
} catch (error) {
    console.log("❌ ERROR:", error.message);
}