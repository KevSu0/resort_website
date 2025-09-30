import 'fake-indexeddb/auto';
import { DatabaseService } from '../../services/databaseService';
// import { OBJECT_STORES } from '../../services/databaseService'; // eslint-disable-line @typescript-eslint/no-unused-vars

describe('DatabaseService', () => {
    // Helper to get a unique DB name for each test to ensure complete isolation
    const getTestDbName = () => `testDB_${Date.now()}_${Math.random()}`;

    // Helper to robustly delete a database
    const deleteDb = (dbName: string) => {
        return new Promise<void>((resolve) => {
            const req = indexedDB.deleteDatabase(dbName);
            req.onsuccess = req.onerror = req.onblocked = () => resolve();
        });
    };

    it('should pass integrity check when database is healthy', async () => {
        const dbName = getTestDbName();
        const dbService = new DatabaseService(dbName, 1);
        await dbService.initialize();

        const result = await dbService.runIntegrityCheck();

        expect(result.passed).toBe(true);
        expect(result.issues).toHaveLength(0);

        dbService.close();
        await deleteDb(dbName);
    });

    it('should detect a missing object store in an integrity check', async () => {
        const dbName = getTestDbName();

        // Manually open the database and create an incomplete schema.
        await new Promise<void>((resolve, reject) => {
            const request = indexedDB.open(dbName, 1);
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                db.createObjectStore('settings', { keyPath: 'id' }); // Incomplete
            };
            request.onsuccess = (event) => {
                (event.target as IDBOpenDBRequest).result.close();
                resolve();
            };
            request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
        });

        const dbService = new DatabaseService(dbName, 1);
        await dbService.initialize();

        const result = await dbService.runIntegrityCheck();

        expect(result.passed).toBe(false);
        expect(result.issues).toContain('Missing object store: properties');

        dbService.close();
        await deleteDb(dbName);
    });

    it('should validate logically invalid data during integrity check', async () => {
        const dbName = getTestDbName();
        const dbService = new DatabaseService(dbName, 1);
        await dbService.initialize();

        const db = dbService.getDb();
        if (!db) throw new Error("DB not available for seeding");

        const tx = db.transaction('enquiries', 'readwrite');
        tx.objectStore('enquiries').add({ id: 'enq1', status: 'NEW', createdAt: 'invalid-date', customer: { name: 'Test', email: '' } });
        await new Promise(resolve => tx.oncomplete = () => resolve(null));

        const result = await dbService.runIntegrityCheck();

        expect(result.passed).toBe(false);
        expect(result.issues).toContain('Enquiry missing customer email');
        expect(result.issues).toContain('Enquiry enq1 has invalid createdAt');

        dbService.close();
        await deleteDb(dbName);
    });

    it('should handle database initialization errors gracefully', async () => {
        const dbName = getTestDbName();
        const dbService = new DatabaseService(dbName, 1);
        const error = new Error('Could not open DB');

        const openSpy = jest.spyOn(indexedDB, 'open').mockImplementation(() => {
            const mockRequest = new EventTarget() as any;
            mockRequest.error = error;
            setTimeout(() => {
                if (mockRequest.onerror) {
                    const event = new Event('error');
                    Object.defineProperty(event, 'target', { value: { error } });
                    mockRequest.onerror(event);
                }
            }, 0);
            return mockRequest;
        });

        await expect(dbService.initialize()).rejects.toBe(error);

        const result = await dbService.runIntegrityCheck();

        expect(result.passed).toBe(false);
        expect(result.issues).toContain('Database integrity check failed: Error: Could not open DB');

        openSpy.mockRestore();
    });
});