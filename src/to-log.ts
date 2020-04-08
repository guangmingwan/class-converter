export var mylog = function () {
  // return Function.prototype.bind.call(console.log, console);
  return () => { }
}()