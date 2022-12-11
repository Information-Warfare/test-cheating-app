from .database import database


class migration:
    def sql3_to_psql(self, k_itters: int = 1):
        """
        SQLite3 to PostgreSQL.

        :param k_itters: count.
        """
        db_sql3 = database(db_type='sqlite3')
        db_psql = database(db_type='postgresql')
        db_psql.drop_base()

        database_params = db_sql3.db_params
        db_psql.create_base(database_params)

        tables = db_sql3.get_tables()
        for table in tables:
            sql3_len = db_sql3.select_count(table)
            for i in range(0, sql3_len, k_itters):
                response = db_sql3.select(table, limit=k_itters)
                for row in response:
                    db_sql3.delete(table, '_id', row[0])
                    db_psql.insert(table, row)
