function ConvertHandler() {
  
  this.getNum = function(input) {
    let unitMatch = input.match(/[a-zA-Z]+$/);
    let numStr = "";
    if (unitMatch) {
      numStr = input.slice(0, unitMatch.index);
    } else {
      numStr = input;
    }
    
    if (numStr === "") return 1;

    let parts = numStr.split('/');
    if (parts.length > 2) return 'invalid number';
    
    let num1 = parts[0];
    let num2 = parts[1] !== undefined ? parts[1] : '1';
    
    if (isNaN(num1) || isNaN(num2) || num1 === '' || num2 === '') {
      return 'invalid number';
    }
    
    return Number(num1) / Number(num2);
  };
  
  this.getUnit = function(input) {
    let unitMatch = input.match(/[a-zA-Z]+$/);
    if (!unitMatch) return 'invalid unit';
    
    let unit = unitMatch[0].toLowerCase();
    if (unit === 'l') return 'L';
    
    const validUnits = ['gal', 'mi', 'km', 'lbs', 'kg'];
    if (validUnits.includes(unit)) {
      return unit;
    }
    
    return 'invalid unit';
  };
  
  this.getReturnUnit = function(initUnit) {
    const unitMap = {
      'gal': 'L',
      'L': 'gal',
      'l': 'gal',
      'mi': 'km',
      'km': 'mi',
      'lbs': 'kg',
      'kg': 'lbs'
    };
    return unitMap[initUnit] || unitMap[initUnit.toLowerCase()];
  };

  this.spellOutUnit = function(unit) {
    const spellMap = {
      'gal': 'gallons',
      'L': 'liters',
      'l': 'liters',
      'mi': 'miles',
      'km': 'kilometers',
      'lbs': 'pounds',
      'kg': 'kilograms'
    };
    return spellMap[unit] || spellMap[unit.toLowerCase()];
  };
  
  this.convert = function(initNum, initUnit) {
    const galToL = 3.78541;
    const lbsToKg = 0.453592;
    const miToKm = 1.60934;
    let result;
    
    let unit = initUnit.toLowerCase();
    if (unit === 'gal') result = initNum * galToL;
    else if (unit === 'l') result = initNum / galToL;
    else if (unit === 'lbs') result = initNum * lbsToKg;
    else if (unit === 'kg') result = initNum / lbsToKg;
    else if (unit === 'mi') result = initNum * miToKm;
    else if (unit === 'km') result = initNum / miToKm;
    
    if (result !== undefined) {
      return parseFloat(result.toFixed(5));
    }
    return result;
  };
  
  this.getString = function(initNum, initUnit, returnNum, returnUnit) {
    return `${initNum} ${this.spellOutUnit(initUnit)} converts to ${returnNum} ${this.spellOutUnit(returnUnit)}`;
  };
  
}

module.exports = ConvertHandler;
