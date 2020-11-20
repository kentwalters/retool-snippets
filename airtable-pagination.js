// Airtable uses cursor-based pagination. This function recursively calls the API as long as the cursor from the previous request exists. 
const fetchAll = (offset, records) => {
  // Base case: we've reached the end, and there are no more cursors.
  if (offset == null) return records
  // Wrap the query result in a promise
  return new Promise((resolve) => {
    return query7.trigger({
    	additionalScope: {
      	   offset
    	},
    	onSuccess: queryResult => {
           // Add the records from this query to all the records we have so far
           const newResults = records.concat(queryResult.records)
           return resolve(fetchAll(queryResult.offset, newResults))
    	}
  	})
  })
}
return fetchAll(0, [])
