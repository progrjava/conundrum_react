const DocxParser = require('docx-parser');
const pdf = require('pdf-parse');
const path = require('path');
// File type validation
// File size validation
// Parsing different file formats (txt, docx, pdf)
// Error handling for file operations
class FileManager {
    constructor() {
        this.supportedTypes = ['.txt', '.docx', '.pdf'];
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
    }

    validateFileType(filename) {
        const extension = path.extname(filename).toLowerCase();
        if (!this.supportedTypes.includes(extension)) {
            throw new Error(`Unsupported file type. Supported types: ${this.supportedTypes.join(', ')}`);
        }
    }

    validateFileSize(file) {
        if (file.size > this.maxFileSize) {
            throw new Error(`File size exceeds limit of ${this.maxFileSize / (1024 * 1024)}MB`);
        }
    }

    async parseFile(file) {
        const extension = path.extname(file.originalname).toLowerCase();
        const buffer = file.buffer;

        try {
            switch (extension) {
                case '.txt':
                    return buffer.toString('utf-8');
                
                case '.docx':
                    return await this.parseDocx(buffer);
                
                case '.pdf':
                    return await this.parsePdf(buffer);
                
                default:
                    throw new Error('Unsupported file type');
            }
        } catch (error) {
            throw new Error(`Error parsing file: ${error.message}`);
        }
    }

    parseDocx(buffer) {
        return new Promise((resolve, reject) => {
            try {
                DocxParser.parseDocx(buffer, (text) => {
                    resolve(text);
                });
            } catch (error) {
                reject(new Error(`Failed to parse DOCX file: ${error.message}`));
            }
        });
    }

    async parsePdf(buffer) {
        try {
            const data = await pdf(buffer);
            return data.text;
        } catch (error) {
            throw new Error(`Failed to parse PDF file: ${error.message}`);
        }
    }
}

module.exports = FileManager;
