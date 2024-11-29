export default (color, black = '#000', white = '#fff') => {

  let r, g, b
  const parse = c => parseInt(c, 16)

  if (color.slice(0, 1) === 'r') {
    // Note(CG): rgb or rgba
    const split = color.split(',')
    r = split[0].split('(')[1];
    g = split[1];
    b = split[2].split(')')[0];

  } else {
    // Note(CG): we assume hexcolor

    // If a leading # is provided, remove it
    if (color.slice(0, 1) === '#') {
      color = color.slice(1);
    }

    // Convert to RGB value
    r = parse(color.substr(0, 2));
    g = parse(color.substr(2, 2));
    b = parse(color.substr(4, 2));
  }

  // Get YIQ ratio
  var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

  // Check contrast
  return (yiq >= 128) ? black : white;

};

