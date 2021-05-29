const observer = {};

observer.stackLayers = [];
observer.errorHandler = {};
module.exports = observer;

function FunctionNode(layer) {
  this.name = layer.name
  this.type = 'function'
  this.fn = layer.handle.toString()
}
function RouteNode(layer) {
  this.path = layer?.route?.path || layer.path
  this.type = 'route'
  this.children = []
  this.stackLength = layer?.route?.stack?.length || layer.handle.stack.length
  // this.method = Object.keys(layer.route.methods)[0]
}
observer.createTree = (app) => {
  const tree = {
    name: 'App',
    children: []
  }
  traverseStack(tree, app._router.stack)
  // console.log(tree.children[8].children)

  return tree;
}
/* 
  Iterate through all layers of the stack 
  If the layer is a route, check for middleware function and recurse through the tree
  If the layer is a function, push it to the application stack
  If layer is a router, continue recursing through the tree
*/
const traverseStack = (tree, stack) => {
  // console.log('Stack passed in: ', stack)

  for (const layer of stack) {
    if (layer.route) {
      const newRoute = new RouteNode(layer)
      tree.children.push(newRoute)
      // Traverse through stack 
      traverseStack(newRoute, layer.route.stack)
    } else if (layer.name === 'router') {
      // Parse the regex expression to create the path name 
      // Attach the path name to the layer
      const regexString = layer.regexp.toString()
      const path = '/' + regexString.slice(4, -13)
      layer.path = path
      // console.log(layer)
      // Create a new route node 
      const newRoute = new RouteNode(layer)
      // console.log('NEW ROUTE', newRoute)
      tree.children.push(newRoute)
      // console.log('NEW ROUTE', path)
      for (const stack of layer.handle.stack) {
        // console.log('STACK', stack.route.stack)
        traverseStack(newRoute, stack.route.stack)
      }
    } else {
      const newFunction = new FunctionNode(layer)
      tree.children.push(newFunction)
    }
  }
}
// createTree(app)