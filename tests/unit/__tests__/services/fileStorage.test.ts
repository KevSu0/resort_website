import 'fake-indexeddb/auto';
import { FileStorageService } from '@/services/fileStorage';
import { DatabaseService, OBJECT_STORES } from '@/services/databaseService';

describe('FileStorageService', () => {
    let databaseService: DatabaseService;
    let fileStorageService: FileStorageService;

    beforeEach(async () => {
        // Use a unique DB name for each test run to ensure isolation
        const dbName = `test_db_fs_${Date.now()}`;
        databaseService = new DatabaseService(dbName);
        await databaseService.initialize();

        // Inject the isolated database service instance
        fileStorageService = new FileStorageService(databaseService);
    });

    afterEach(async () => {
        // Clean up the specific database instance
        const dbName = (databaseService as { dbName: string }).dbName;
        databaseService.close();
        await new Promise<void>(resolve => {
            const req = indexedDB.deleteDatabase(dbName);
            req.onsuccess = req.onerror = () => resolve();
        });
    });

    describe('getStorageUsage', () => {
        it('should calculate storage usage correctly for a populated database', async () => {
            // Arrange: Seed the database with data large enough to be measured
            const db = databaseService.getDb();
            if (!db) throw new Error('Test setup failed: DB not available');

            const tx = db.transaction(OBJECT_STORES.map(s => s.name), 'readwrite');
            tx.objectStore('media').add({ id: 'file1', data: 'x'.repeat(1024 * 50) }); // 50KB
            tx.objectStore('draftContent').add({ id: 'content1', data: 'y'.repeat(1024 * 50) }); // 50KB

            await new Promise<void>((resolve, reject) => {
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });

            // Act
            const usage = await fileStorageService.getStorageUsage();

            // Assert
            expect(usage.used).toBeGreaterThan(0);
            expect(usage.breakdown.media).toBeGreaterThan(0);
            expect(usage.breakdown.content).toBeGreaterThan(0);
        });

        it('should return zero usage for an empty database', async () => {
            const usage = await fileStorageService.getStorageUsage();
            expect(usage.used).toBe(0);
        });

        it('should handle database errors gracefully', async () => {
            // Arrange: Mock the initialize method to simulate a connection failure
            jest.spyOn(databaseService, 'initialize').mockRejectedValue(new Error('DB Init Failed'));
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            // Act
            const usage = await fileStorageService.getStorageUsage();

            // Assert
            expect(usage.used).toBe(0);
            expect(consoleSpy).toHaveBeenCalledWith('Failed to get storage usage:', expect.any(Error));

            consoleSpy.mockRestore();
        });
    });
});
