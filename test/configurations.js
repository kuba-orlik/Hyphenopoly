/* eslint-env node */
/* eslint global-require: 0, func-names: 0, no-shadow: 0 */
"use strict";
const t = require("tap");

let H9Y = null;

t.test("set options: compound", function (t) {
    t.beforeEach(function setup(done) {
        H9Y = require("../hyphenopoly.module");
        done();
    });

    t.afterEach(function tearDown(done) {
        H9Y = null;
        delete require.cache[require.resolve("../hyphenopoly.module")];
        done();
    });

    t.test("compound: all", async function (t) {
        const hyphenator = await H9Y.config({
            "compound": "all",
            "hyphen": "•",
            "require": ["de"]
        });
        await t.test("check result", function (t) {
            t.equal(hyphenator("Silbentrennungs-Algorithmus"), "Sil•ben•tren•nungs-\u200BAl•go•rith•mus");
            t.end();
        });
    });
    t.test("compound: auto", async function (t) {
        const hyphenator = await H9Y.config({
            "compound": "auto",
            "hyphen": "•",
            "require": ["de"]
        });
        await t.test("check result", function (t) {
            t.equal(hyphenator("Silbentrennungs-Algorithmus"), "Sil•ben•tren•nungs-Al•go•rith•mus");
            t.end();
        });
    });
    t.test("compound: hyphen", async function (t) {
        const hyphenator = await H9Y.config({
            "compound": "hyphen",
            "hyphen": "•",
            "require": ["de"]
        });
        await t.test("check result", function (t) {
            t.equal(hyphenator("Silbentrennungs-Algorithmus"), "Silbentrennungs-\u200BAlgorithmus");
            t.end();
        });
    });
    t.test("compound: auto, one part too small", async function (t) {
        const hyphenator = await H9Y.config({
            "compound": "auto",
            "hyphen": "•",
            "require": ["de"]
        });
        await t.test("check result", function (t) {
            t.equal(hyphenator("Test-Algorithmus"), "Test-Al•go•rith•mus");
            t.end();
        });
    });
    t.test("compound: all, one part too small", async function (t) {
        const hyphenator = await H9Y.config({
            "compound": "all",
            "hyphen": "•",
            "require": ["de"]
        });
        await t.test("check result", function (t) {
            t.equal(hyphenator("Test-Algorithmus"), "Test-\u200BAl•go•rith•mus");
            t.end();
        });
    });
    t.end();
});

t.test("set options: exceptions", function (t) {
    t.beforeEach(function setup(done) {
        H9Y = require("../hyphenopoly.module");
        done();
    });

    t.afterEach(function tearDown(done) {
        H9Y = null;
        delete require.cache[require.resolve("../hyphenopoly.module")];
        done();
    });

    t.test("exceptions: global (only)", async function (t) {
        const hyphenator = await H9Y.config({
            "exceptions": {"global": "Silben-trennung"},
            "hyphen": "•",
            "require": ["de"]
        });
        await t.test("check result", function (t) {
            t.equal(hyphenator("Silbentrennung"), "Silben•trennung");
            t.end();
        });
    });
    t.test("exceptions: global and lang", async function (t) {
        const hyphenator = await H9Y.config({
            "exceptions": {
                "de": "Algo-rithmus",
                "global": "Silben-trennung"
            },
            "hyphen": "•",
            "require": ["de"]
        });
        await t.test("check result", function (t) {
            t.equal(hyphenator("Silbentrennung Algorithmus"), "Silben•trennung Algo•rithmus");
            t.end();
        });
    });
    t.test("exceptions: double entry", async function (t) {
        const hyphenator = await H9Y.config({
            "exceptions": {"de": "Algo-rithmus, Algo-rithmus"},
            "hyphen": "•",
            "require": ["de"]
        });
        await t.test("check result", function (t) {
            t.equal(hyphenator("Algorithmus"), "Algo•rithmus");
            t.end();
        });
    });
    t.end();
});

t.test("set options: hyphen", function (t) {
    t.beforeEach(function setup(done) {
        H9Y = require("../hyphenopoly.module");
        done();
    });

    t.afterEach(function tearDown(done) {
        H9Y = null;
        delete require.cache[require.resolve("../hyphenopoly.module")];
        done();
    });

    t.test("hyphen: •", async function (t) {
        const hyphenator = await H9Y.config({
            "hyphen": "•",
            "require": ["de"]
        });
        await t.test("check result", function (t) {
            t.equal(hyphenator("Silbentrennung"), "Sil•ben•tren•nung");
            t.end();
        });
    });
    t.test("hyphen: |", async function (t) {
        const hyphenator = await H9Y.config({
            "hyphen": "|",
            "require": ["de"]
        });
        await t.test("check result", function (t) {
            t.equal(hyphenator("Silbentrennung"), "Sil|ben|tren|nung");
            t.end();
        });
    });
    t.end();
});

t.test("set options: left-/rightmin (patterns: 2/2)", function (t) {
    t.beforeEach(function setup(done) {
        H9Y = require("../hyphenopoly.module");
        done();
    });

    t.afterEach(function tearDown(done) {
        H9Y = null;
        delete require.cache[require.resolve("../hyphenopoly.module")];
        done();
    });

    t.test("left-/rightmin: 4, 5", async function (t) {
        const hyphenator = await H9Y.config({
            "hyphen": "•",
            "leftmin": 4,
            "require": ["de"],
            "rightmin": 5
        });
        await t.test("check result", function (t) {
            t.equal(hyphenator("Silbentrennung"), "Silben•trennung");
            t.end();
        });
    });
    t.end();
});

t.test("set options: left-/rightmin (patterns: 2/3)", function (t) {
    t.beforeEach(function setup(done) {
        H9Y = require("../hyphenopoly.module");
        done();
    });

    t.afterEach(function tearDown(done) {
        H9Y = null;
        delete require.cache[require.resolve("../hyphenopoly.module")];
        done();
    });

    t.test("left-/rightmin: 2, 2", async function (t) {
        const hyphenator = await H9Y.config({
            "hyphen": "•",
            "leftmin": 2,
            "require": ["pt"],
            "rightmin": 2
        });
        await t.test("check result", function (t) {
            t.equal(hyphenator("relativo"), "re•la•ti•vo");
            t.end();
        });
    });

    t.test("left-/rightmin: def, def", async function (t) {
        const hyphenator = await H9Y.config({
            "hyphen": "•",
            "require": ["pt"]
        });
        await t.test("check result", function (t) {
            t.equal(hyphenator("relativo"), "re•la•tivo");
            t.end();
        });
    });
    t.end();
});

t.test("set options: minWordLength", function (t) {
    t.beforeEach(function setup(done) {
        H9Y = require("../hyphenopoly.module");
        done();
    });

    t.afterEach(function tearDown(done) {
        H9Y = null;
        delete require.cache[require.resolve("../hyphenopoly.module")];
        done();
    });

    t.test("minWordLength: 7", async function (t) {
        const hyphenator = await H9Y.config({
            "hyphen": "•",
            "minWordLength": 7,
            "require": ["de"]
        });
        await t.test("check result", function (t) {
            t.equal(hyphenator("Die Asse essen lieber gesunde Esswaren"), "Die Asse essen lieber ge•sun•de Ess•wa•ren");
            t.end();
        });
    });
    t.end();
});

t.test("set options: normalize", function (t) {
    t.beforeEach(function setup(done) {
        H9Y = require("../hyphenopoly.module");
        done();
    });

    t.afterEach(function tearDown(done) {
        H9Y = null;
        delete require.cache[require.resolve("../hyphenopoly.module")];
        done();
    });

    t.test("normalize: true", async function (t) {
        const hyphenator = await H9Y.config({
            "hyphen": "•",
            "normalize": true,
            "require": ["de"]
        });
        await t.test("check result", function (t) {
            t.equal(hyphenator("Ba\u0308rento\u0308ter"), "Bä•ren•tö•ter");
            t.end();
        });
    });
    t.end();
});

t.test("set options: orphanControl", function (t) {
    t.beforeEach(function setup(done) {
        H9Y = require("../hyphenopoly.module");
        done();
    });

    t.afterEach(function tearDown(done) {
        H9Y = null;
        delete require.cache[require.resolve("../hyphenopoly.module")];
        done();
    });

    t.test("orphanControl: 1 (default)", async function (t) {
        const hyphenator = await H9Y.config({
            "hyphen": "•",
            "require": ["de"]
        });
        await t.test("check result", function (t) {
            t.equal(hyphenator("Die Asse essen lieber gesunde Esswaren"), "Die Asse essen lie•ber ge•sun•de Ess•wa•ren");
            t.end();
        });
    });
    t.test("orphanControl: 2", async function (t) {
        const hyphenator = await H9Y.config({
            "hyphen": "•",
            "orphanControl": 2,
            "require": ["de"]
        });
        await t.test("check result", function (t) {
            t.equal(hyphenator("Die Asse essen lieber gesunde Esswaren"), "Die Asse essen lie•ber ge•sun•de Esswaren");
            t.end();
        });
    });
    t.test("orphanControl: 2, hyphen: |", async function (t) {
        const hyphenator = await H9Y.config({
            "hyphen": "|",
            "orphanControl": 2,
            "require": ["de"]
        });
        await t.test("check result", function (t) {
            t.equal(hyphenator("Die Asse essen lieber gesunde Esswaren"), "Die Asse essen lie|ber ge|sun|de Esswaren");
            t.end();
        });
    });
    t.test("orphanControl: 3", async function (t) {
        const hyphenator = await H9Y.config({
            "hyphen": "•",
            "orphanControl": 3,
            "require": ["de"]
        });
        await t.test("check result", function (t) {
            t.equal(hyphenator("Die Asse essen lieber gesunde Esswaren"), "Die Asse essen lie•ber ge•sun•de\u00A0Esswaren");
            t.end();
        });
    });
    t.end();
});
