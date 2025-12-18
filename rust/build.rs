use std::process::Command;

fn main() {
    let git_hash = Command::new("git")
        .args(["rev-parse", "HEAD"])
        .output()
        .expect("failed to get git hash");
    let git_hash = String::from_utf8(git_hash.stdout).unwrap();
    println!("cargo:rustc-env=GIT_HASH={}", git_hash.trim());

    let compile_time = Command::new("date")
        .args(["-u", "+%Y-%m-%d %H:%M:%S UTC"])
        .output()
        .expect("failed to get date");
    let compile_time = String::from_utf8(compile_time.stdout).unwrap();
    println!("cargo:rustc-env=COMPILE_TIME={}", compile_time.trim());
}
