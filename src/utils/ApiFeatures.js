export class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }
  pagination() {
    let page = this.queryString.page * 1 || 1;
    if (page < 1) page = 1;
    let limit = 2;
    let skip = (page - 1) * limit;
    this.mongooseQuery = productmodel.find().skip(skip).limit(limit);
    this.page = page;
    return this;
  }
  filter() {
    let executeQuery = ["page", "sort", "search", "select"];
    let filterquery = { ...req.query }; //shallow copy
    executeQuery.forEach((e) => delete filterquery[e]);
    filterquery = JSON.parse(
      JSON.stringify(filterquery).replace(
        /(gt|lt|lte|gte|eq)/g,
        (match) => `$${match}`
      )
    );
    this.mongooseQuery.find(filterquery);
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      this.mongooseQuery.sort(this.queryString.sort.replaceAll(",", " "));
    }
    return this;
  }
  select() {
    if (this.queryString.select) {
      this.mongooseQuery.select(this.queryString.select.replaceAll(",", " "));
    }
  }
  search() {
    if (this.queryString.search) {
      this.mongooseQuery.find({
        $or: [
          {
            title: { $regex: this.queryString.search, $options: "i" },
            description: { $regex: this.queryString.search, $options: "i" },
          },
        ],
      });
    }
  }
}
