use anyhow::Result;
use std::env;

use oxscape::{GIT_HASH, GridMeta, Params, generate_boring_terrain, print_dem, run};

pub fn main() -> Result<()> {
    let args: Vec<String> = env::args().collect();

    if args.len() != 4 {
        eprintln!("Syntax: {} <Dimension> <Steps> <Output Name>", args[0]);
        return Err(anyhow::format_err!(
            "Syntax: {} <Dimension> <Steps> <Output Name>",
            args[0]
        ));
    }

    let width = args[1].parse()?;
    let height = width;
    let nstep = args[2].parse()?;
    let out_name = &args[3];
    // let rand_seed = u64::from_str_radix(&args[4], 10)?;

    println!("A FastScape RB+PI");
    println!("C Richard Barnes + Fee TODO");
    println!("h git_hash {GIT_HASH}");
    let m = GridMeta::new(width, height);
    let mut h = vec![0.0; m.size()];
    generate_boring_terrain(&m, 0.0, 1.0 / 64.0, &mut h);
    run(nstep, &m, &Params::default(), &mut h);

    // let mut dem  = vec![0.0; m.size()];
    // generate_boring_terrain(&m, 0.0, 1.0/64.0, &mut dem);
    // order_d8::run(nstep, &m, &Params::default(), &mut dem)?;
    print_dem(out_name, &h, &width, &height)?;
    Ok(())
}
