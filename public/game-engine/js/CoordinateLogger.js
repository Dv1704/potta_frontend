/**
 * Coordinate Conversion Logging Utility
 * 
 * Logs the exact pixel-to-percentage difference when balls sync from server.
 * Use this to debug "ball jump" issues and verify conversion accuracy.
 * 
 * Usage in CTable.js:
 * - Import: var CoordinateLogger = new CCoordinateLogger();
 * - Call: CoordinateLogger.logConversion(ballId, serverX, serverY, pixelX, pixelY);
 */

function CCoordinateLogger() {
    var CANVAS_WIDTH = 1800;
    var CANVAS_HEIGHT = 900;
    var _aConversionHistory = [];
    var _bEnabled = true;

    /**
     * Log a single ball's coordinate conversion
     */
    this.logConversion = function (ballId, serverX, serverY, pixelX, pixelY) {
        if (!_bEnabled) return;

        // Calculate what pixels SHOULD be based on server percentages
        var expectedPixelX = (serverX / 100) * CANVAS_WIDTH;
        var expectedPixelY = (serverY / 100) * CANVAS_HEIGHT;

        // Calculate error (difference between expected and actual)
        var errorX = Math.abs(pixelX - expectedPixelX);
        var errorY = Math.abs(pixelY - expectedPixelY);
        var totalError = Math.sqrt(errorX * errorX + errorY * errorY);

        var conversionData = {
            ballId: ballId,
            server: { x: serverX, y: serverY },
            expectedPixels: { x: expectedPixelX, y: expectedPixelY },
            actualPixels: { x: pixelX, y: pixelY },
            error: { x: errorX, y: errorY, total: totalError },
            timestamp: new Date().toISOString()
        };

        _aConversionHistory.push(conversionData);

        // Visual console logging with color coding
        var status = totalError < 1 ? '✅' : totalError < 5 ? '⚠️' : '❌';
        var color = totalError < 1 ? 'color: green' : totalError < 5 ? 'color: orange' : 'color: red';

        console.log(
            `%c${status} Ball ${ballId} Conversion:`,
            color,
            `Server: (${serverX.toFixed(2)}%, ${serverY.toFixed(2)}%)`,
            `→ Expected: (${expectedPixelX.toFixed(1)}px, ${expectedPixelY.toFixed(1)}px)`,
            `→ Actual: (${pixelX.toFixed(1)}px, ${pixelY.toFixed(1)}px)`,
            `| Error: ${totalError.toFixed(2)}px`
        );

        // Warn if error is significant
        if (totalError > 5) {
            console.warn(
                `⚠️ LARGE CONVERSION ERROR for Ball ${ballId}!`,
                `This will cause visible "jumps". Check CANVAS constants.`
            );
        }
    };

    /**
     * Log all balls in a batch (call this in updateBallsFromServer)
     */
    this.logBatchConversion = function (serverBalls, actualBalls) {
        if (!_bEnabled) return;

        console.group('📊 Ball Position Sync - Coordinate Conversion');

        for (var ballId in serverBalls) {
            if (serverBalls.hasOwnProperty(ballId) && actualBalls[ballId]) {
                var serverData = serverBalls[ballId];
                var actualBall = actualBalls[ballId];

                // Assumes actualBall has getX() and getY() methods
                var actualX = actualBall.getX ? actualBall.getX() : actualBall.x;
                var actualY = actualBall.getY ? actualBall.getY() : actualBall.y;

                this.logConversion(ballId, serverData.x, serverData.y, actualX, actualY);
            }
        }

        console.groupEnd();
    };

    /**
     * Get conversion statistics
     */
    this.getStats = function () {
        if (_aConversionHistory.length === 0) {
            return { message: 'No conversions logged yet' };
        }

        var totalConversions = _aConversionHistory.length;
        var totalError = 0;
        var maxError = 0;
        var perfectCount = 0;

        _aConversionHistory.forEach(function (conv) {
            totalError += conv.error.total;
            if (conv.error.total > maxError) {
                maxError = conv.error.total;
            }
            if (conv.error.total < 1) {
                perfectCount++;
            }
        });

        var avgError = totalError / totalConversions;
        var accuracy = (perfectCount / totalConversions) * 100;

        return {
            totalConversions: totalConversions,
            averageError: avgError.toFixed(2) + 'px',
            maxError: maxError.toFixed(2) + 'px',
            perfectConversions: perfectCount,
            accuracy: accuracy.toFixed(1) + '%'
        };
    };

    /**
     * Print stats to console
     */
    this.printStats = function () {
        var stats = this.getStats();
        console.table(stats);
    };

    /**
     * Clear history
     */
    this.clear = function () {
        _aConversionHistory = [];
        console.log('🗑️ Coordinate conversion history cleared');
    };

    /**
     * Enable/disable logging
     */
    this.setEnabled = function (enabled) {
        _bEnabled = enabled;
        console.log(`📊 Coordinate logging ${enabled ? 'ENABLED' : 'DISABLED'}`);
    };

    /**
     * Verify canvas constants match backend
     */
    this.verifyConstants = function () {
        console.group('🔍 Verifying Coordinate Conversion Constants');
        console.log('Frontend CANVAS_WIDTH:', CANVAS_WIDTH, '(should be 1800)');
        console.log('Frontend CANVAS_HEIGHT:', CANVAS_HEIGHT, '(should be 900)');
        console.log('Backend Constants.CANVAS_WIDTH:', '1800 (hardcoded in server)');
        console.log('Backend Constants.CANVAS_HEIGHT:', '900 (hardcoded in server)');

        if (CANVAS_WIDTH === 1800 && CANVAS_HEIGHT === 900) {
            console.log('%c✅ Constants match! Conversion should be accurate.', 'color: green; font-weight: bold');
        } else {
            console.error('❌ MISMATCH! Frontend and backend canvas sizes don\'t match.');
            console.error('This will cause all balls to jump to wrong positions!');
        }

        console.groupEnd();
    };
}

// Make globally available for browser console testing
if (typeof window !== 'undefined') {
    window.CoordinateLogger = CCoordinateLogger;
    console.log('📊 CoordinateLogger loaded. Use window.CoordinateLogger in console.');
}
