#html5 Gauge

A simple html5 canvas gauge.

## Examples

### Simple
    var g1 = new Gauge('gauge1');
    g1.bind('text1');
    g1.setValue(75);

### With callback
    var g2 = new Gauge('gauge2', {'gaugeColor':'#ddd', 'needleColor':'#555'});
    g2.bind('text2');
    g2.max = 30;
    g2.setValue(10, function() {
       setTimeout(function() { g2.setValue(28); }, 1500);
    });
