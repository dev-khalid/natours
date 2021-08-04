class APIFeatures {
  constructor(query, queryString) {
    this.query = query; //Tour.find()
    this.queryString = queryString; //request.query  -> it's in json formate
  }

  filter() {
    //1(A) Simple filtering
    const queryObj = { ...this.queryString };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);
    //now we get the query params with excluded fields .
    //1(B) Advanced filtering with >= OR <= OR > OR < FEATURE on a certain field
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr)); //here we are finding result with our queryStr obj.
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');//separating fieldNames with a space. 
      this.query = this.query.sort(sortBy);//this.query.sort('fieldNames name duration price')
    } else {
      this.query = this.query.sort('-createdAt'); //here minus fieldName means that we want to sort the data using this field in DESCENDING ORDER.
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);//This will select the fields. 
    } else {
      this.query = this.query.select('-__v'); //it selects all the data but __v filed is excluded by default
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1; //it picks up the truthy value;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
