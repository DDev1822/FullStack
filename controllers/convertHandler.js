function ConvertHandler() {
  
  this.getNum = function(input) {
    let result;
    // Extraer todo antes de la primera letra (que es donde empieza la unidad)
    let numRegex = /^[^a-zA-Z]+/;
    let match = input.match(numRegex);
    
    // Si no hay número, el defecto es 1
    if (!match) return 1;

    let numStr = match[0].trim();
    
    // Si hay más de un "/", es una fracción doble inválida
    if (numStr.split('/').length > 2) {
      return 'invalid number';
    }

    if (numStr.includes('/')) {
      let nums = numStr.split('/');
      let n1 = Number(nums[0]);
      let n2 = Number(nums[1]);
      if (isNaN(n1) || isNaN(n2)) return 'invalid number';
      result = n1 / n2;
    } else {
      result = Number(numStr);
      if (isNaN(result)) return 'invalid number';
    }
    
    return result;
  };
  
  this.getUnit = function(input) {
    let unitRegex = /[a-zA-Z]+$/;
    let match = input.match(unitRegex);
    if (!match) return 'invalid unit';
    
    let unit = match[0].toLowerCase();
    const validUnits = ['gal', 'l', 'mi', 'km', 'lbs', 'kg'];
    if (!validUnits.includes(unit)) return 'invalid unit';
    
    return unit === 'l' ? 'L' : unit;
  };
  
  this.getReturnUnit = function(initUnit) {
    const map = {
      'gal': 'L',
      'L': 'gal',
      'mi': 'km',
      'km': 'mi',
      'lbs': 'kg',
      'kg': 'lbs'
    };
    return map[initUnit] || 'invalid unit';
  };

  this.spellOutUnit = function(unit) {
    const map = {
      'gal': 'gallons',
      'L': 'liters',
      'mi': 'miles',
      'km': 'kilometers',
      'lbs': 'pounds',
      'kg': 'kilograms'
    };
    return map[unit] || 'invalid unit';
  };
  
  this.convert = function(initNum, initUnit) {
    const galToL = 3.78541;
    const lbsToKg = 0.453592;
    const miToKm = 1.60934;
    let result;
    
    switch(initUnit) {
      case 'gal': result = initNum * galToL; break;
      case 'L': result = initNum / galToL; break;
      case 'lbs': result = initNum * lbsToKg; break;
      case 'kg': result = initNum / lbsToKg; break;
      case 'mi': result = initNum * miToKm; break;
      case 'km': result = initNum / miToKm; break;
      default: return 'invalid number';
    }
    
    return Number(result.toFixed(5));
  };
  
  this.getString = function(initNum, initUnit, returnNum, returnUnit) {
    return `${initNum} ${this.spellOutUnit(initUnit)} converts to ${returnNum} ${this.spellOutUnit(returnUnit)}`;
  };
  
}

module.exports = ConvertHandler;
