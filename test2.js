const arr = [
  {
    name: 'HRM',
    functionality: {
      Employee Metadata: {
        Employee Metadata1: {
          Divisions: ['List', 'Add', 'Edit'],
          Districts: ['List', 'Add', 'Edit'],
          Office_Divisions: ['List', 'Add', 'Edit'],
          Departments: ['List', 'Add', 'Edit'],
          Designations: ['List', 'Add', 'Edit'],
          Institutes: ['List', 'Add', 'Edit'],
          Degrees: ['List', 'Add', 'Edit'],
          Banks: ['List', 'Add', 'Edit'],
          Branches: ['List', 'Add', 'Edit'],
          Action_Types: ['List', 'Add', 'Edit'],
          Action_Reasons: ['List', 'Add', 'Edit'],
        },
        Employee_Metadata2: {
          Divisions: ['List', 'Add', 'Edit'],
          Districts: ['List', 'Add', 'Edit'],
          Office_Divisions: ['List', 'Add', 'Edit'],
          Departments: ['List', 'Add', 'Edit'],
          Designations: ['List', 'Add', 'Edit'],
          Institutes: ['List', 'Add', 'Edit'],
          Degrees: ['List', 'Add', 'Edit'],
          Banks: ['List', 'Add', 'Edit'],
          Branches: ['List', 'Add', 'Edit'],
          Action_Types: ['List', 'Add', 'Edit'],
          Action_Reasons: ['List', 'Add', 'Edit'],
        },
      },
      Manage_Employee: {
        Employee_List: ['List', 'Add', 'Edit'],
        Leave_Status: ['List', 'Add', 'Edit'],
        Attendance: ['List', 'Add', 'Edit'],
        Promotions: ['List', 'Add', 'Edit'],
        Terminations: ['List', 'Add', 'Edit'],
        Warning: ['List', 'Add', 'Edit'],
      },
    },
  },
  {
    name: 'FICO',
    functionality: {
      General_Ledger: {
        Divisions: ['List', 'Add', 'Edit'],
        Districts: ['List', 'Add', 'Edit'],
      },
      Accounts Payable: {
        Employee List: ['List', 'Add', 'Edit'],
        Leave Status: ['List', 'Add', 'Edit'],
      },
      Cash management: {
        Employee List: ['List', 'Add', 'Edit'],
        Leave Status: ['List', 'Add', 'Edit'],
      },
    },
  },
  {
    name: 'MM',
    functionality: JSON.stringify({
      Asset_Accounting: {
        Divisions: ['List', 'Add', 'Edit'],
        Distraicts: ['List', 'Add', 'Edit'],
      },
      Funds_management: {
        Employee List: ['List', 'Add', 'Edit'],
        Leave_Status: ['List', 'Add', 'Edit'],
      },
      Treasury_Management: {
        Employee_List: ['List', 'Add', 'Edit'],
        Leave_Status: ['List', 'Add', 'Edit'],
      },
    }),
  },
  {
    name: 'FSCM',
    functionality:{
      Sales: {
        Divisions: ['List', 'Add', 'Edit'],
        Districts: ['List', 'Add', 'Edit'],
      },
      Shipping_and_transportation: {
        Employee_List: ['List', 'Add', 'Edit'],
        Leave_Status: ['List', 'Add', 'Edit'],
      },
      Bills_of_Material: {
        Employee_List: ['List', 'Add', 'Edit'],
        Leave_Status: ['List', 'Add', 'Edit'],
      },
    },
  },
];



/**
 * typeof array kina . 
 * typeof object kina . 
 */
function fun(element) {
  if(Array.isArray(element)) { 
    const newArrayOfChildren; 
    for(const arrayElement in element) { 
      newArrayOfChildren.push({
        value: arrayElement, 
        label: arrayElement, 
        children: fun(arrayElement)
      });
    }
    return newArrayOfChildren; 
  }
  else if(typeof(element)==='object'){ 
    const newArrayOfChildren; 
    for(const property in element) { 
      newArrayOfChildren.push({
        value: property, 
        label: property, 
        children: fun(element[property]) 
      }); 
    }
    return newArrayOfChildren; 
  } else { 
    return { 
      value: toString(element), 
      label: toString(element), 
    }
  }
}
// arr.map(obj => (
//   {
//     value: obj.name,
//     label: obj.name, 
//     children: fun(obj.functionality), 
//   }
// ))