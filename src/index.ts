import { AirlineDocument } from './types';
import { jsonResponse, errorResponse } from './utils';

export interface Env {
	DATA_API_ACCESS_KEY: string;
	DATA_API_SECRET_KEY: string;
	DATA_API_ENDPOINT: string;
}

const BUCKET_NAME = "travel-sample";
const SCOPE_NAME = "inventory";
const COLLECTION_NAME = "airline";

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const token = `${env.DATA_API_ACCESS_KEY}:${env.DATA_API_SECRET_KEY}`;
		const encodedToken = btoa(token);
		const commonHeaders = {
			'Authorization': `Basic ${encodedToken}`,
			'Content-Type': 'application/json',
		};

		const { pathname } = new URL(request.url);

		// Handle root path with a welcome message
		if (pathname === '/') {
			return jsonResponse(
				{ message: "Welcome to the Airline Data API. Please use /airlines/<document_key> to access data." },
				200
			);
		}

		const pathParts = pathname.split('/');

		if (!(pathParts.length === 3 && pathParts[1] === 'airlines' && pathParts[2])) {
			return errorResponse(
				`Invalid path. Expected /airlines/<document_key>. Path received: ${pathname}`,
				404
			);
		}
		const documentKey = pathParts[2];
		const documentCouchbasePath = `https://${env.DATA_API_ENDPOINT}/v1/buckets/${BUCKET_NAME}/scopes/${SCOPE_NAME}/collections/${COLLECTION_NAME}/documents/${documentKey}`;

		try {
			if (request.method === 'GET') {
				console.log(`Making GET request to: ${documentCouchbasePath}`);
				const response = await fetch(documentCouchbasePath, {
					method: 'GET',
					headers: commonHeaders,
				});
				if (!response.ok) {
					const errorBody = await response.text();
					console.error(`GET API Error (${response.status}): ${errorBody}`);
					return errorResponse(
						`Error fetching airline data: ${response.statusText}. Detail: ${errorBody}`,
						response.status
					);
				}
				const data = await response.json();
				return jsonResponse(data, response.status);
			}

			else if (request.method === 'POST') { 
				console.log(`Making POST request to: ${documentCouchbasePath}`);
				let newDocumentData: AirlineDocument;
				try {
					newDocumentData = await request.json<AirlineDocument>();
				} catch (e) {
					return errorResponse('Invalid JSON in request body for new airline', 400);
				}
				const response = await fetch(documentCouchbasePath, {
					method: 'POST',
					headers: commonHeaders,
					body: JSON.stringify(newDocumentData),
				});

				if (!response.ok && response.status !== 201) {
					const errorBody = await response.text();
					console.error(`POST API Error (${response.status}): ${errorBody}`);
					return errorResponse(
						`Error creating airline document: ${response.statusText}. Detail: ${errorBody}`,
						response.status
					);
				}
				const responseData = await response.json().catch(() => ({}));
				return jsonResponse(responseData, response.status);
			}

			else if (request.method === 'PUT') { 
				console.log(`Making PUT request to: ${documentCouchbasePath}`);
				let updateData: AirlineDocument;
				try {
					updateData = await request.json<AirlineDocument>();
				} catch (e) {
					return errorResponse('Invalid JSON in request body for airline update', 400);
				}
				const response = await fetch(documentCouchbasePath, {
					method: 'PUT',
					headers: commonHeaders,
					body: JSON.stringify(updateData),
				});
				if (!response.ok) {
					const errorBody = await response.text();
					console.error(`PUT API Error (${response.status}): ${errorBody}`);
					return errorResponse(
						`Error updating airline document: ${response.statusText}. Detail: ${errorBody}`,
						response.status
					);
				}

				const responseData = await response.json().catch(() => (response.status === 204 ? {} : { message: 'Updated' }));
				return jsonResponse(responseData, response.status);
			}

			else if (request.method === 'DELETE') {
				console.log(`Making DELETE request to: ${documentCouchbasePath}`);
				const response = await fetch(documentCouchbasePath, {
					method: 'DELETE',
					headers: commonHeaders,
				});
				if (!response.ok && response.status !== 204) {
					const errorBody = await response.text();
					console.error(`DELETE API Error (${response.status}): ${errorBody}`);
					return errorResponse(
						`Error deleting airline document: ${response.statusText}. Detail: ${errorBody}`,
						response.status
					);
				}
				return jsonResponse({ message: `Airline document ${documentKey} deleted successfully.` }, response.status === 204 ? 204 : response.status);
			}

			else {
				return errorResponse('Method Not Allowed', 405);
			}

		} catch (error: any) {
			console.error("Fetch handler failed:", error);
			return errorResponse(`Internal Server Error: ${error.message}`, 500);
		}
	},
} satisfies ExportedHandler<Env>;
