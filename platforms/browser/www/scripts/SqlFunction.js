
var errCallback = function (message) {
    AddLogSql('ERROR', 'Sql', message);
}

var errLogCallback = function () {
    toastr.error("Impossible d'acceder à la table log", "BDD");
}


// InforTerminal
var InforTerminal = function (successCallback) {
    databaseHandler.db.transaction(function (transaction) {
        transaction.executeSql((
            "select terminal.id, credit_commission, debit_commission, terminal_name, terminal.terminal_number, terminal_user, terminal_username, terminal_url, date, terminal_mode, terminal_name, terminal_currency, terminal_currency_symbol, terminal_version, \
        terminal_welcome_text \
        from terminal \
        left join terminal_information on terminal.terminal_number = terminal_information.terminal_number \
        order by 1 desc limit 1"), [],
            function (transaction, results) { successCallback(results); }, function (tx, error) { alert(error.message); AddLogSql(errCallback(error)) });
    });
};

// ChartDasboard
var ChartDasboard = function (successCallback) {
    databaseHandler.db.transaction(function (transaction) {
        transaction.executeSql(("select 'Debit' as chart_type, SUM(amount) as total, SUM(commission) as commission from transactions where type_id = 1  UNION ALL select 'Credit', SUM(amount), SUM(commission) from transactions where type_id = 2 "), [],
            function (transaction, results) { successCallback(results); }, function (tx, error) { alert(error.message); AddLogSql(errCallback(error.message)) });
    });
};




//Add Log SQL
var AddLogSql = function (level, category, message) {

    var AddLogSql2 = function (results) {
        var user = results.rows.item(0).terminal_user;

        databaseHandler.db.transaction(function (transaction) {
            transaction.executeSql("insert INTO log(level, category, message, user) values(?,?,?,?) ", [level, category, message, user],
                function (tx, results) {
                    //console.log(results);
                },
                errLogCallback
            );
        });
    }
    InforTerminal(AddLogSql2);
};


// Getkey
var Getkey = function (successCallback) {
    databaseHandler.db.transaction(function (transaction) {
        transaction.executeSql(("select id, name, state_id from key order by state_id asc "), [],
            function (transaction, results) { successCallback(results); }, function (tx, error) { AddLogSql(errCallback(error.message)) });
    });
};

// GetMasterKey
var GetMasterKey = function (successCallback) {
    databaseHandler.db.transaction(function (transaction) {
        transaction.executeSql(("select id, name, state_id from key where state_id = 1 order by 1 desc "), [],
            function (transaction, results) { successCallback(results); }, function (tx, error) { AddLogSql(errCallback(error.message)) });
    });
};

// CheckCardBlocked
var CheckCardBlocked = function (card_number, successCallback) {
    databaseHandler.db.transaction(function (transaction) {
        transaction.executeSql(("select * from card where number = ? and state_id = 2"), [card_number],
            function (transaction, results) { successCallback(results); }, function (tx, error) { AddLogSql(errCallback(error.message)) });
    });
};


//Add Card SQL
var AddCardSql = function (name, firstname, number, card_id, user_id, state_id) {
    databaseHandler.db.transaction(function (transaction) {
        transaction.executeSql("insert INTO card(name, firstname, number, card_id, user_id, state_id) values(?,?,?,?,?,?) ", [name, firstname, number, card_id, user_id, state_id],
            function (tx, results) {
                AddLogSql('INFO', 'Card', 'Carte ajoutée: Numero ' + number);
            },
            function (tx, error) { AddLogSql(errCallback(error.message)) });
    });
};

var DeleteCardSql = function (successCallback) {
    databaseHandler.db.transaction(
        function (tx) {
            tx.executeSql(
                "Delete from card where state_id not in (1)", [],
                function (transaction, results) { successCallback(results); }, function (tx, error) { AddLogSql(errCallback(error.message)) });
        }
    );
}

var DeleteCardIdSql = function (card_id) {
    databaseHandler.db.transaction(function (transaction) {
        transaction.executeSql(
            "Delete from card where card_id = ? and state_id = 1", [card_id],
            function (tx, results) {
                AddLogSql('INFO', 'Card', 'Suppression de la carte après synchronisation: ' + card_id);
            },
            function (tx, error) { AddLogSql(errCallback(error.message)) });
    }
    );
}


// GetCommission
var GetCommissionSql = function (successCallback) {
    databaseHandler.db.transaction(function (transaction) {
        transaction.executeSql(("select credit_commission, debit_commission from terminal order by 1 desc limit 1"), [],
            function (transaction, results) { successCallback(results); }, function (tx, error) { AddLogSql(errCallback(error.message)) });
    });
};


var PayTransactionsHandler = {
    addTransactions: function (card_number, terminal_number, terminal_user, amount, commission, percentage, type, key, card_amount, card_grant) {
        databaseHandler.db.transaction(
            function (tx) {
                var comment = '';
                tx.executeSql(
                    "insert into transactions(card, card_amount, card_grant, terminal_number, terminal_user, amount, commission, percentage, type_id, comment, key) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [card_number, card_amount, card_grant, terminal_number, terminal_user, amount, commission, percentage, type, comment, key],
                    function (tx, results) {

                        AddLogSql('INFO', 'Transaction', 'Transactions Ajouté : [Carte:' + card_number + ']  [Montant Carte:' + card_amount + ']  [Droit Carte:' + card_grant + '] [Montant:' + amount + ']  [Type:' + type + ']');
                    },
                    function (tx, error) { AddLogSql(errCallback(error.message)) });
            },
            function (error) { },
            function () { }
        );
    },
    cancelTransactions: function (internal_id) {
        databaseHandler.db.transaction(
            function (tx) {
                tx.executeSql(
                    "update transactions set state_id = 2 where id= ?",
                    [internal_id],
                    function (tx, results) { },
                    function (tx, error) { AddLogSql(errCallback(error.message)) });
            },
            function (error) { },
            function () { }
        );
    },
    loadTransactions: function (displayTransactions, type_id, other_type_id) {
        databaseHandler.db.readTransaction(
            function (tx) {
                tx.executeSql(
                    "select * from transactions  where type_id in (?) or type_id in (?) order by 1 desc limit 50",
                    [type_id, other_type_id],
                    function (tx, results) {
                        //Do the display
                        displayTransactions(results);
                        AddLogSql('INFO', 'Transaction', 'Chargement de la table des transactions');
                    },
                    function (tx, error) { AddLogSql(errCallback(error.message)) });
            }
        );
    },
    loadCards: function (displayCards) {
        databaseHandler.db.readTransaction(
            function (tx) {
                tx.executeSql(
                    "select * from card where state_id !=1 order by state_id desc limit 50", //on ne récupère pas les cartes actives
                    [],
                    function (tx, results) {
                        //Do the display
                        displayCards(results);
                        AddLogSql('INFO', 'Card', 'Chargement de la table des cartes');
                    },
                    function (tx, error) { AddLogSql(errCallback(error.message)) });
            }
        );
    },
    loadLogs: function (displayLogs) {
        databaseHandler.db.readTransaction(
            function (tx) {
                tx.executeSql(
                    "select *, substr(message, 1, 53) as small_message from log  order by 1 desc limit 100",
                    [],
                    function (tx, results) {
                        //Do the display
                        displayLogs(results);
                        AddLogSql('INFO', 'Log', 'Chargement des logs');
                    },
                    function (tx, error) { AddLogSql(errCallback(error.message)) });
            }
        );
    },
    SynchroTransactions: function (SynchroTransactionsToServer) {
        databaseHandler.db.readTransaction(
            function (tx) {
                tx.executeSql(
                    "select * from transactions where sync = 0",
                    [],
                    function (tx, results) {
                        SynchroTransactionsToServer(results);
                    },
                    function (tx, error) { AddLogSql(errCallback(error.message)) });
            }
        );
    },
    ChangeTransactionsSync: function (internal_id) {
        databaseHandler.db.transaction(
            function (tx) {
                tx.executeSql(
                    "update transactions set sync = 1 where id= ?",
                    [internal_id],
                    function (tx, results) {
                        AddLogSql('INFO', 'Transaction', 'Mise à jour de la transaction synchronisé ' + internal_id);
                    },
                    function (tx, error) { AddLogSql(errCallback(error.message)) });
            }
        );
    },
    SynchroLog: function (SynchroLogToServer) {
        databaseHandler.db.readTransaction(
            function (tx) {
                tx.executeSql(
                    "select * from log where sync = 0",
                    [],
                    function (tx, results) {
                        SynchroLogToServer(results);
                    },
                    function (tx, error) { AddLogSql(errCallback(error.message)) });
            }
        );
    },
    ChangeLogSync: function (internal_id) {
        databaseHandler.db.transaction(
            function (tx) {
                tx.executeSql(
                    "update log set sync = 1 where id= ?",
                    [internal_id],
                    function (tx, results) {
                        //nothing
                    },
                    function (tx, error) { AddLogSql(errCallback(error.message)) });
            }
        );
    },

    UpdateTerminalSql: function (terminal_number, terminal_user, terminal_username, terminal_name, terminal_mode, credit_commission, debit_commission, terminal_currency, terminal_currency_symbol, terminal_version, terminal_url) {
        databaseHandler.db.transaction(
            function (tx) {
                tx.executeSql(
                    "update terminal set terminal_name = ?, terminal_user = ?, terminal_username = ?, terminal_mode = ?, credit_commission = ?, debit_commission = ?, terminal_currency = ?, terminal_currency_symbol = ?, terminal_version = ? , terminal_url = ? where terminal_number= ?",
                    [terminal_name, terminal_user, terminal_username, terminal_mode, credit_commission, debit_commission, terminal_currency, terminal_currency_symbol, terminal_version, terminal_url, terminal_number],
                    function (tx, results) {
                        AddLogSql('INFO', 'Terminal', 'Mise à jour des du terminal N° ' + terminal_number + ': [terminal_name =' + terminal_name + '] [terminal_user =' + terminal_user + '] [terminal_username =' + terminal_username + '] [terminal_mode =' + terminal_mode + '] [credit_commission =' + credit_commission + '] [debit_commission =' + debit_commission + '] [terminal_currency =' + terminal_currency + '] [terminal_currency_symbol =' + terminal_currency_symbol + '] [terminal_version =' + terminal_version + '] [terminal_url =' + terminal_url + ']');
                    },
                    function (tx, error) { AddLogSql(errCallback(error.message)) });
            }
        );
    },

    ForceUpdateTerminalSql: function (terminal_id, terminal_mode, terminal_url) {
        databaseHandler.db.transaction(
            function (tx) {
                tx.executeSql(
                    "update terminal set terminal_mode = ?, terminal_url = ? where id= ?",
                    [terminal_mode, terminal_url, terminal_id],
                    function (tx, results) {
                        toastr.warning("Le terminal a été mis à jour. Toutefois, vous pouvez perdre les modifications s'il est connecté au serveur", "Terminal");
                        AddLogSql('INFO', 'Terminal', 'Mise à jour du terminal par Admin');
                    },
                    function (tx, error) { AddLogSql(errCallback(error.message)) });
            }
        );
    },


    CreateUpdateTerminalInformationSql: function (terminal_number, terminal_welcome_text) {
        databaseHandler.db.transaction(
            function (tx) {
                tx.executeSql(
                    'INSERT OR REPLACE into terminal_information(id, terminal_number, terminal_welcome_text) values(?,?,?)',
                    [1, terminal_number, terminal_welcome_text],
                    function (tx, results) {
                        AddLogSql('INFO', 'Terminal', 'Mise à jour des informations du terminal N° ' + terminal_number + ': [terminal_welcome_text =' + terminal_welcome_text + ']');
                    },
                    function (tx, error) { AddLogSql(errCallback(error.message)) });
            }
        );
    },

    AddInfoTerminalSql: function (terminal_number, terminal_user, terminal_pin, terminal_url) {
        databaseHandler.db.transaction(
            function (tx) {
                tx.executeSql(
                    "insert OR IGNORE into  terminal (terminal_number,terminal_user,terminal_pin,terminal_url) VALUES (?,?,?,?)",
                    [terminal_number, terminal_user, terminal_pin, terminal_url],
                    function (tx, results) {
                        AddLogSql('INFO', 'Terminal', 'Ajout des informations du terminal');
                        $('.sync-loader').hide();
                        window.location.href = "welcome.html";
                    },
                    function (tx, error) { AddLogSql(errCallback(error.message)) });
            }
        );
    },

    DeleteKeySql: function () {
        databaseHandler.db.transaction(

            function (tx) {
                tx.executeSql(
                    "Delete from key",
                    [],
                    function (tx, results) {
                        AddLogSql('INFO', 'Clé', 'Suppression clés de sécurités');
                    },
                    function (tx, error) { AddLogSql(errCallback(error.message)) });
            }
        );
    },
    AddNewKeySql: function (key_name, key_state_id) {
        databaseHandler.db.transaction(
            function (tx) {
                tx.executeSql(
                    "insert into  key (name,state_id) VALUES (?,?)",
                    [key_name, key_state_id],
                    function (tx, results) {
                        //var key = key_name.substr(0,3)+ 'XXXXXXXXXX'+ key_name.substr(key_name.length - 4);
                        //AddLogSql('INFO', 'Clé', 'Ajout de la nouvelles clé ' + key);		
                    },
                    function (tx, error) { AddLogSql(errCallback(error.message)) });
            }
        );
    },

    // liste des cartes à envoyer vers le serveurs
    SynchroActiveCards: function (SynchroActiveCardsToServer) {
        databaseHandler.db.readTransaction(
            function (tx) {
                tx.executeSql(
                    "select * from card where state_id = 1",
                    [],
                    function (tx, results) {
                        SynchroActiveCardsToServer(results);
                    },
                    function (tx, error) { AddLogSql(errCallback(error.message)) });
            }
        );
    },
    AddCard: function (name, firstname, number, card_id, user_id, state_id) {
        databaseHandler.db.transaction(
            function (tx) {
                tx.executeSql(
                    "insert INTO card(name, firstname, number, card_id, user_id, state_id) values(?,?,?,?,?,?) ",
                    [name, firstname, number, card_id, user_id, state_id],
                    function (tx, results) {
                    },
                    function (tx, error) { AddLogSql(errCallback(error.message)) });
            },
            function (error) { },
            function () { }
        );
    },
    ActiveCard: function (card_id) {
        databaseHandler.db.transaction(
            function (tx) {
                tx.executeSql(
                    "UPDATE card set state_id = 1 where card_id = (?) ",
                    [card_id],
                    function (tx, results) {
                        //console.log('card_id : ' + card_id + ' - results : ' + results);
                    },
                    function (tx, error) { AddLogSql(errCallback(error.message)) });
            },
            function (error) { },
            function () { }
        );
    }
};




/*
// This is the SAVE function
    var saveWinkle = function(winklename, location, successCallback){
        db.transaction(function(transaction){
            transaction.executeSql(("INSERT INTO winkles (winklename, location) VALUES (?, ?);"),
            [winklename, location], function(transaction, results){successCallback(results);}, function(tx, error){ AddLogSql( errCallback(error.message) ) };);
        });
    };

    // This is a LOAD function, which pulls all winkles for a given location
    var loadWinkles = function(location, successCallback){
        db.transaction(function(transaction){
            transaction.executeSql(("SELECT * FROM winkles WHERE location=?"), [location],
                function(transaction, results){successCallback(results);}, function(tx, error){ AddLogSql( errCallback(error.message) ) };);
            });
    };
https://gist.github.com/benpoole/1041277
*/
