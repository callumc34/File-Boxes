const Box = class Box {
    /**
     * Constructs a new box
     *
     * @param      {string}  name         The name of the box
     * @param      {string}  description  The description of the box
     * @param      {int}  fileId       The file identifier for the box
     */
    constructor(
        name,
        description,
        fileId
    ) {
        this.name = name;
        this.description = description;
        this.fileId = fileId;
    }
}

/**
 * Creates a box from a query
 *
 * @param    {Object}  config  The configuration
 * @return     {Box}     { description_of_the_return_value }
 */
const createBox = (query) => {
    if (query.name == null || query.description == null) return null;
    return new Box(query.name, query.description, query.fileId);
}

module.exports = {
    Box,
    createBox,
}