var databaseHandler = {
db: null,
createDatabase: function(){
    this.db = window.openDatabase(
        "nyapay.db",
        "1.0",
        "nyapay database",
        1000000);
    this.db.transaction(
        function(tx){
            //Run sql here using tx

            
          /* tx.executeSql(				
                "DROP table terminal",
                [],
                function(tx, results){
					//console.log("Table Transction: " + results);
				},
                function(tx, error){
                    console.log("Error Table Transction: " + error.message);
                }
            );*/
            
            tx.executeSql(				
                "create table if not exists log(id integer primary key, date DEFAULT (STRFTIME('%Y-%m-%d %H:%M', 'NOW', 'localtime')), user text, level text, category text, message text, sync integer DEFAULT 0)",
                [],
                function(tx, results){
					//console.log("Table Transction: " + results);
				},
                function(tx, error){
                    console.log("Error : " + error.message);
                }
            );
            
            tx.executeSql(				
                "create table if not exists key(id integer primary key, name text, state_id integer)",
                [],
                function(tx, results){
					//console.log("Table Transction: " + results);
				},
                function(tx, error){
                    console.log("Error : " + error.message);
                }
            );
            
			tx.executeSql(				
                "create table if not exists transactions(id integer primary key, date DEFAULT (STRFTIME('%Y-%m-%d %H:%M', 'NOW', 'localtime')), terminal_number text, terminal_user text, card text, card_amount numeric, key text, type_id integer, amount numeric, commission numeric, percentage text, sync integer DEFAULT 0, state_id integer DEFAULT 1, comment text)",
                [],
                function(tx, results){
					//console.log("Table Transction: " + results);
				},
                function(tx, error){
                    console.log("Error : " + error.message);
                }
            );
            
            tx.executeSql(				
                "create table if not exists terminal(id integer primary key, date DEFAULT (STRFTIME('%Y-%m-%d %H:%M', 'NOW', 'localtime')),  terminal_number text, terminal_user text, terminal_username text, terminal_pin text, terminal_url text, credit_commission text, debit_commission text, terminal_mode text, terminal_name text, terminal_currency, terminal_currency_symbol, terminal_version text, UNIQUE(terminal_number) )",
                [],
                function(tx, results){
					//console.log("Table Transction: " + results);
				},
                function(tx, error){
                    console.log("Error : " + error.message);
                }
            );
            

            /*tx.executeSql(				
                "DROP table card",
                [],
                function(tx, results){
					//console.log("Table Transction: " + results);
				},
                function(tx, error){
                    console.log("Error Table Transction: " + error.message);
                }
            );*/
            
            tx.executeSql(				
                "create table if not exists card(id integer primary key, name text, firstname text, number text, card_id integer, user_id integer, state_id integer, UNIQUE(card_id))",
                [],
                function(tx, results){
					//console.log("Table cardblocked: " + results);
				},
                function(tx, error){
                    console.log("Error : " + error.message);
                }
            );
            
            /*tx.executeSql(				
                "INSERT INTO card VALUES (101,'ok', 'ok','ok', 1, 2, 1)",
                [],
                function(tx, results){
					//console.log("Table Transction: " + results);
				},
                function(tx, error){
                    console.log("Error Table Transction: " + error.message);
                }
            );*/
            

			
        },
        function(error){
            console.log("Create DB error: " + error.message);
        },
        function(){
            console.log("Create DB  completed successfully");
        }
    );

}
}