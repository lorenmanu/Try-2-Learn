./hello &
sleep 1
kill $! 2>/dev/null && echo "ERROR"
