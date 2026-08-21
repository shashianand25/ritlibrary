/**
 * Backend Structured JSON Logger
 */

export const logger = {
	info: (message, context = {}) => {
		console.log(
			JSON.stringify({
				timestamp: new Date().toISOString(),
				level: 'INFO',
				message,
				context,
			}),
		);
	},
	warn: (message, context = {}) => {
		console.warn(
			JSON.stringify({
				timestamp: new Date().toISOString(),
				level: 'WARN',
				message,
				context,
			}),
		);
	},
	error: (message, error = {}) => {
		const errorDetails = error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error;
		console.error(
			JSON.stringify({
				timestamp: new Date().toISOString(),
				level: 'ERROR',
				message,
				error: errorDetails,
			}),
		);
	},
};

export default logger;
