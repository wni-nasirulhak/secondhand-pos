const XLSX = require('xlsx');

/**
 * Generate an Excel buffer from a list of comments
 * @param {Array} comments 
 * @returns {Buffer}
 */
function generateExcelBuffer(comments) {
    if (!Array.isArray(comments)) return null;

    // Prepare data for XLSX
    const data = comments.map(c => ({
        'Timestamp': c.timestamp,
        'Username': c.username,
        'Comment': c.comment,
        'Type': c.isInternal ? 'System' : 'User'
    }));

    // Create Worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Set Column Widths
    const wscols = [
        { wch: 25 }, // Timestamp
        { wch: 20 }, // Username
        { wch: 50 }, // Comment
        { wch: 10 }  // Type
    ];
    ws['!cols'] = wscols;

    // Create Workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Comments');

    // Write to Buffer
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

module.exports = {
    generateExcelBuffer
};
