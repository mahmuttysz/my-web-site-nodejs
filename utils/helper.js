function formatDate(dateString) {
    if (!dateString) return 'Devam Ediyor';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    let formatted = date.toLocaleDateString('tr-TR', { 
        month: 'long', 
        year: 'numeric' 
    });

    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

module.exports = { formatDate };