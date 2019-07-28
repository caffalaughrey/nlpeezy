// 'use strict';
//
// const assert = require('assert');
//
// const Tree = require('../src/utils/tree').Tree;
//
// const INVALID_OUTPUT = 'Wrong output.';
//
// class ValueNode extends Tree {
//   constructor(value) {
//     super(value);
//
//     this.parent = null;
//     this.value = value;
//     this.index = null;
//   }
// }
//
// class OuterNode extends ValueNode {}
//
// class InnerNode extends ValueNode {}
//
// class DeepNode extends ValueNode {}
//
// class SkipNode extends ValueNode {}
//
// function makeNodes(arr, type, parent) {
//   let nodes = [];
//
//   arr.forEach(value => {
//     let node = new type(value);
//
//     node.parent = parent;
//
//     nodes.push(node);
//   });
//
//   return nodes;
// }
//
// function makeTwoLevelTree(addSkip) {
//   let parent = new OuterNode('1');
//   let children = makeNodes(['a','b','c'], InnerNode, parent);
//
//   if (addSkip) {
//     let skip = new SkipNode('d');
//
//     skip.parent = parent;
//
//     children.push(skip);
//   }
//
//   parent.children = children;
//
//   return parent;
// }
//
// function makeThreeLevelTree(addSkip) {
//   let parent = makeTwoLevelTree(addSkip);
//   let children = parent.children;
//
//   children[0].children = makeNodes(['aa'], DeepNode, children[0]);
//   children[1].children = makeNodes(['ba', 'bb'], DeepNode, children[1]);
//   children[2].children = makeNodes(['ca', 'cb', 'cc'], DeepNode, children[2]);
//
//   if (addSkip) {
//     children[3].children = makeNodes(['da','db','dc','dd'], DeepNode, children[3]);
//   }
//
//   return parent;
// }
//
// describe('/utils/tree', () => {
// 	describe('#Tree', () => {
//     it('knows a single node', done => {
//       let tree = new OuterNode('1');
//       let output = [];
//
//       tree.walk((node, level, next) => {
//         output.push(node.value);
//
//         next();
//       }).then(_ => {
//         assert(output.join(' ') == '1', INVALID_OUTPUT);
//
//         done();
//       });
//     });
//
//     it('knows its nodes from a tree of two levels', done => {
//       let tree = makeTwoLevelTree();
//       let output = [];
//
//       tree.walk((node, level, next) => {
//         output.push(node.value);
//
//         next();
//       }).then(_ => {
//         assert(output.join(' ') == '1 a b c', INVALID_OUTPUT);
//
//         done();
//       });
//     });
//
//     it('knows its nodes from a tree of three levels', done => {
//       let tree = makeThreeLevelTree();
//       let output = [];
//
//       tree.walk((node, level, next) => {
//         output.push(node.value);
//
//         next();
//       }).then(_ => {
//         assert(output.join(' ') == '1 a aa b ba bb c ca cb cc', INVALID_OUTPUT);
//
//         done();
//       });
//     });
//
//     it('knows its nodes from a tree of three levels filtered by type', done => {
//       let tree = makeThreeLevelTree();
//       let output = [];
//
//       tree.walk((node, level, next) => {
//         if (node instanceof DeepNode) {
//           output.push(node.value);
//         }
//
//         next();
//       }).then(_ => {
//         assert(output.join(' ') == 'aa ba bb ca cb cc', INVALID_OUTPUT);
//
//         done();
//       });
//     });
//
//     it('knows better than to try and walk non-tree child nodes', done => {
//       let parent = new OuterNode('1');
//
//       parent.children = ['str1', 'str2'];
//
//       let output = [];
//
//       parent.walk((node, level, next) => {
//         if (node instanceof Tree) {
//           output.push(node.value);
//         } else if(typeof node == 'string') {
//           output.push(node)
//         }
//
//         next();
//       }).then(_ => {
//         assert(output.join(' ') == '1 str1 str2', INVALID_OUTPUT);
//
//         done();
//       });
//     });
//
//     it('knows to quit walking when depth is set to 2', done => {
//       let depth = 2;
//       let tree = makeThreeLevelTree();
//       let output = [];
//
//       tree.walk(depth, (node, level, next) => {
//         output.push(node.value);
//
//         next();
//       }).then(_ => {
//         assert(output.join(' ') == '1 a b c', INVALID_OUTPUT);
//
//         done();
//       });
//     });
//
//     it('knows its filtered, mapped nodes from a tree of three levels', done => {
//       let tree = makeThreeLevelTree();
//       let output = [];
//       let filterFn = (node, level) =>
//         node.value.indexOf('a') > -1 ? node.value : undefined;
//
//       tree.filterMap(filterFn).then(output => {
//         assert(output.join(' ') == 'a aa ba ca', INVALID_OUTPUT);
//
//         done();
//       });
//     });
//
//     it('knows its unwound nodes', done => {
//       let addSkip = true;
//       let lastIndex = 0;
//       let tree = makeThreeLevelTree(addSkip);
//       let transformFn = child => {
//         child.index = lastIndex;
//         lastIndex += child.value.length;
//       };
//
//       tree.unwind(InnerNode, transformFn).then(output => {
//         // console.log(output);
//         // TODO: Write assertions against output
//         done();
//       });
//     });
// 	});
// });
