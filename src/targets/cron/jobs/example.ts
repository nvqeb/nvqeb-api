async function example(): Promise<void> {
    console.log("Example cron job");
}

example().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
});
