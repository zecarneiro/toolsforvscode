import { GenericFunctions } from './generic-functions';
import { Response } from '../interface/response';
import * as sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import { Messages } from '../enum/messages';

export interface SqliteResponse {
    file: string;
    database: Database<sqlite3.Database, sqlite3.Statement>;
}

export class SqliteFunctions {
    private dbConn: SqliteResponse | undefined;
    constructor() {}

    async open(file: string): Promise<Response<SqliteResponse>> {
        let response: Response<SqliteResponse> = {
            message: '',
            status: false
        } as Response<SqliteResponse>;

        if (file && file.length > 0) {
            if (GenericFunctions.fileExist(file)) {
                file = GenericFunctions.resolvePath(file);
                if (this.dbConn && file !== this.dbConn.file) {
                    this.endConnection();
                }

                if (!this.dbConn) {
                    this.dbConn = {
                        file: file,
                        database: await open({
                            filename: file,
                            driver: sqlite3.Database
                        })
                    };
                }
                response.data = this.dbConn;
            } else {
                response.message = GenericFunctions.replaceAll(Messages.INVALID_SQLITE_DB_FILE, [{search: '{0}', toReplace: file}]);
            }
        }
        response.status = response.data ? true : false;
        return response;
    }

    endConnection() {
        if (this.dbConn && this.dbConn.database) {
            this.dbConn.database.close();
            this.dbConn = undefined;
        }
    }
}