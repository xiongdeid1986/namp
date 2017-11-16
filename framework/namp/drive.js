const exec = require("./command.js").exec;
/*取得磁盘的信息*/
//AllDrive();
function AllDrive(callback,debug){
    exec([`wmic logicaldisk where "drivetype=3" get freespace,name`],function(result) {
        if(debug) console.log(result);
        result = result.replace(/\r/g, '');
        result = result.replace(/\n\n/g, "\n");
        result = result.replace(/\n$/g, "");
        result = result.split("\n");
        result = Array.prototype.slice.call(result);
        if ( result[0] && /Name.*/.test( result[0] ) ) {
            result.splice( 0, 1 );
        }
        var d = {};
        result.forEach( ( drive ) => {
            drive = drive.replace(/^\s*?|\s*$/g, "");
            drive = drive.replace(/\s\s/g, " ");
            drive = drive.replace(/\s\s/g, " ");
            var a = drive.split(" ");
            var b = a[0] ? a[0] : 0;
            a = a[1] ? a[1] : "";
            if( a ) {
                a = a.replace(/[^a-zA-Z]/g, '');
                b = parseInt( b );
            }
            if( b > 0 ){
                d[a] = Math.floor( ( b/1024/1024/1024 ) * 100 ) / 100;
            }
        });
        if(!callback || debug){
            console.log(d);
        }
        if(callback){
            callback(d);
        }
    })
}
exports.get_drive = AllDrive;