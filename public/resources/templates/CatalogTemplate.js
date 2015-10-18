function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (baseUrl) {
buf.push("<?xml version=\"1.0\" encoding=\"utf-8\" ?><document><head><style>.whiteText {\n  color: rgb(255, 255, 255);\n}</style></head><catalogTemplate><banner><title>Store Catalog</title></banner><list><section><header><title>Section Header</title></header><listItemLockup><title>Title 1</title><decorationLabel>6</decorationLabel><relatedContent><grid><section><lockup><img" + (jade.attr("src", "" + (baseUrl) + "resources/images/lolz/pug.png", true, false)) + " width=\"308\" height=\"308\"></img><title class=\"whiteText\">FUCK YEAH PUG!</title></lockup></section></grid></relatedContent></listItemLockup></section></list></catalogTemplate></document>");}.call(this,"baseUrl" in locals_for_with?locals_for_with.baseUrl:typeof baseUrl!=="undefined"?baseUrl:undefined));;return buf.join("");
}