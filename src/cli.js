import jason from './jason';

process.stdin.setEncoding('utf8');

var input = '';

process.stdin.on('readable', function() {
  var chunk = process.stdin.read();
  if (chunk !== null) {
    input += chunk;
  }
});

process.stdin.on('end', function() {
  console.log(jason(input));
});
