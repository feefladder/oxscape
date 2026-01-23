//! The consumer implementation from Barnes
//! 

use async_channel::unbounded;
use ordered_float::{Float, FloatCore};
use oxscape::GridMeta;

use crate::fill::NextUp;


pub struct Producer<T: FloatCore +NextUp> {
    producer: ProducerSpecifics<T>,
    meta: GridMeta,
}

// impl<T: FloatCore + NextUp> Producer {
//     fn 
// }

pub struct ProducerSpecifics<T: FloatCore + NextUp> {
    graph_elevations: Vec<T>
}


// template<class elev_t>
// class ProducerSpecifics {
//  public:
//   Timer timer_io, timer_calc;

//  private:
//   std::vector<elev_t> graph_elev;

//   void HandleEdge(
//     const std::vector<elev_t>  &elev_a,
//     const std::vector<elev_t>  &elev_b,
//     const std::vector<label_t> &label_a,
//     const std::vector<label_t> &label_b,
//     std::vector< std::map<label_t, elev_t> > &mastergraph,
//     const label_t label_a_offset,
//     const label_t label_b_offset
//   ){
//     //Guarantee that all vectors are of the same length
//     assert(elev_a.size ()==elev_b.size ());
//     assert(label_a.size()==label_b.size());
//     assert(elev_a.size ()==label_b.size());

//     int len = elev_a.size();

//     for(int i=0;i<len;i++){
//       auto c_l = label_a[i];
//       if(c_l>1) c_l+=label_a_offset;

//       for(int ni=i-1;ni<=i+1;ni++){
//         if(ni<0 || ni==len)
//           continue;
//         auto n_l = label_b[ni];
//         if(n_l>1) n_l+=label_b_offset;
//         //TODO: Does this really matter? We could just ignore these entries
//         if(c_l==n_l) //Only happens when labels are both 1
//           continue;

//         auto elev_over = std::max(elev_a[i],elev_b[ni]);
//         if(mastergraph.at(c_l).count(n_l)==0 || elev_over<mastergraph.at(c_l)[n_l]){
//           mastergraph[c_l][n_l] = elev_over;
//           mastergraph[n_l][c_l] = elev_over;
//         }
//       }
//     }
//   }

//   void HandleCorner(
//     const elev_t  elev_a,
//     const elev_t  elev_b,
//     label_t       l_a,
//     label_t       l_b,
//     std::vector< std::map<label_t, elev_t> > &mastergraph,
//     const label_t l_a_offset,
//     const label_t l_b_offset
//   ){
//     if(l_a>1) l_a += l_a_offset;
//     if(l_b>1) l_b += l_b_offset;
//     auto elev_over = std::max(elev_a,elev_b);
//     if(mastergraph.at(l_a).count(l_b)==0 || elev_over<mastergraph.at(l_a)[l_b]){
//       mastergraph[l_a][l_b] = elev_over;
//       mastergraph[l_b][l_a] = elev_over;
//     }
//   }

//  public:
//   void Calculations(TileGrid &tiles, Job1Grid<elev_t> &jobs1){
//     //Merge all of the graphs together into one very big graph. Clear information
//     //as we go in order to save space, though I am not sure if the map::clear()
//     //method is not guaranteed to release space.
//     std::cerr<<"Constructing mastergraph..."<<std::endl;
//     std::cerr<<"Merging graphs..."<<std::endl;
//     timer_calc.start();
//     Timer timer_mg_construct;
//     timer_mg_construct.start();

//     const int gridheight = tiles.size();
//     const int gridwidth  = tiles[0].size();

//     //Get a tile size so we can calculate the max label
//     label_t maxlabel = 0;
//     for(int y=0;y<gridheight;y++)
//     for(int x=0;x<gridwidth;x++)
//       maxlabel+=jobs1[y][x].graph.size();
//     std::cerr<<"!Total labels required: "<<maxlabel<<std::endl;

//     std::vector< std::map<label_t, elev_t> > mastergraph(maxlabel);

//     label_t label_offset = 0;
//     for(int y=0;y<gridheight;y++)
//     for(int x=0;x<gridwidth;x++){
//       if(tiles[y][x].nullTile)
//         continue;

//       auto &this_job = jobs1.at(y).at(x);

//       tiles[y][x].label_offset = label_offset;

//       for(int l=0;l<(int)this_job.graph.size();l++)
//       for(auto const &skey: this_job.graph[l]){
//         label_t first_label  = l;
//         label_t second_label = skey.first;
//         if(first_label >1) first_label +=label_offset;
//         if(second_label>1) second_label+=label_offset;
//         //We insert both ends of the bidirectional edge because in the watershed
//         //labeling process, we only inserted one. We need both here because we
//         //don't know which end of the edge we will approach from as we traverse
//         //the spillover graph.
//         mastergraph.at(first_label)[second_label] = skey.second;
//         mastergraph.at(second_label)[first_label] = skey.second;
//       }
//       tiles[y][x].label_increment = this_job.graph.size();
//       label_offset                += this_job.graph.size();
//       this_job.graph.clear();
//     }

//     std::cerr<<"Handling adjacent edges and corners..."<<std::endl;
//     for(int y=0;y<gridheight;y++)
//     for(int x=0;x<gridwidth;x++){
//       if(tiles[y][x].nullTile)
//         continue;

//       auto &c = jobs1[y][x];

//       if(y>0            && !tiles[y-1][x].nullTile)
//         HandleEdge(c.top_elev,   jobs1[y-1][x].bot_elev,   c.top_label,   jobs1[y-1][x].bot_label,   mastergraph, tiles[y][x].label_offset, tiles[y-1][x].label_offset);

//       if(y<gridheight-1 && !tiles[y+1][x].nullTile)
//         HandleEdge(c.bot_elev,   jobs1[y+1][x].top_elev,   c.bot_label,   jobs1[y+1][x].top_label,   mastergraph, tiles[y][x].label_offset, tiles[y+1][x].label_offset);

//       if(x>0            && !tiles[y][x-1].nullTile)
//         HandleEdge(c.left_elev,  jobs1[y][x-1].right_elev, c.left_label,  jobs1[y][x-1].right_label, mastergraph, tiles[y][x].label_offset, tiles[y][x-1].label_offset);

//       if(x<gridwidth-1  && !tiles[y][x+1].nullTile)
//         HandleEdge(c.right_elev, jobs1[y][x+1].left_elev,  c.right_label, jobs1[y][x+1].left_label,  mastergraph, tiles[y][x].label_offset, tiles[y][x+1].label_offset);


//       //I wish I had wrote it all in LISP.
//       //Top left
//       if(y>0 && x>0                      && !tiles[y-1][x-1].nullTile)
//         HandleCorner(c.top_elev.front(), jobs1[y-1][x-1].bot_elev.back(),  c.top_label.front(), jobs1[y-1][x-1].bot_label.back(),  mastergraph, tiles[y][x].label_offset, tiles[y-1][x-1].label_offset);

//       //Bottom right
//       if(y<gridheight-1 && x<gridwidth-1 && !tiles[y+1][x+1].nullTile)
//         HandleCorner(c.bot_elev.back(),  jobs1[y+1][x+1].top_elev.front(), c.bot_label.back(),  jobs1[y+1][x+1].top_label.front(), mastergraph, tiles[y][x].label_offset, tiles[y+1][x+1].label_offset);

//       //Top right
//       if(y>0 && x<gridwidth-1            && !tiles[y-1][x+1].nullTile)
//         HandleCorner(c.top_elev.back(),  jobs1[y-1][x+1].bot_elev.front(), c.top_label.back(),  jobs1[y-1][x+1].bot_label.front(), mastergraph, tiles[y][x].label_offset, tiles[y-1][x+1].label_offset);

//       //Bottom left
//       if(x>0 && y<gridheight-1           && !tiles[y+1][x-1].nullTile)
//         HandleCorner(c.bot_elev.front(), jobs1[y+1][x-1].top_elev.back(),  c.bot_label.front(), jobs1[y+1][x-1].top_label.back(),  mastergraph, tiles[y][x].label_offset, tiles[y+1][x-1].label_offset);
//     }
//     timer_mg_construct.stop();

//     std::cerr<<"!Mastergraph constructed in "<<timer_mg_construct.accumulated()<<"s. "<<std::endl;

//     //Clear the jobs1 data from memory since we no longer need it
//     jobs1.clear();
//     jobs1.shrink_to_fit();


//     std::cerr<<"Performing aggregated priority flood"<<std::endl;
//     Timer agg_pflood_timer;
//     agg_pflood_timer.start();
//     typedef std::pair<elev_t, label_t>  graph_node;
//     std::priority_queue<graph_node, std::vector<graph_node>, std::greater<graph_node> > open;
//     std::queue<graph_node> pit;
//     std::vector<bool>   visited(maxlabel,false); //TODO
//     graph_elev.resize(maxlabel);                 //TODO

//     open.emplace(std::numeric_limits<elev_t>::lowest(),1);

//     while(open.size()>0 || pit.size()>0){
//       graph_node c;
//       if(pit.size()>0){
//         c = pit.front();
//         pit.pop();
//       } else {
//         c = open.top();
//         open.pop();
//       }

//       auto my_elev       = c.first;
//       auto my_vertex_num = c.second;
//       if(visited[my_vertex_num])
//         continue;

//       graph_elev[my_vertex_num] = my_elev;
//       visited   [my_vertex_num] = true;

//       for(auto &n: mastergraph[my_vertex_num]){
//         auto n_vertex_num = n.first;
//         auto n_elev       = n.second;
//         if(visited[n_vertex_num])
//           continue;
//         open.emplace(std::max(my_elev,n_elev),n_vertex_num);
//         //Turning on these lines activates the improved priority flood. It is
//         //disabled to make the algorithm easier to verify by inspection, and
//         //because it made little difference in the overall speed of the algorithm.

//         // if(n_elev<=my_elev){
//         //   pit.emplace(my_elev,n_vertex_num);
//         // } else {
//         //   open.emplace(n_elev,n_vertex_num);
//         // }
//       }
//     }
//     agg_pflood_timer.stop();
//     std::cerr<<"!Aggregated priority flood time: "<<agg_pflood_timer.accumulated()<<"s."<<std::endl;
//     timer_calc.stop();
//   }

//   Job2<elev_t> DistributeJob2(const TileGrid &tiles, int tx, int ty){
//     timer_calc.start();
//     auto job2 = Job2<elev_t>(graph_elev.begin()+tiles[ty][tx].label_offset,graph_elev.begin()+tiles[ty][tx].label_offset+tiles[ty][tx].label_increment);
//     timer_calc.stop();
//     return job2;
//   }
// };

#[cfg(test)]
mod test {
    #[tokio::test]
    async fn test_channel() {
        let (s,r1) = async_channel::unbounded();
        let r2 = r1.clone();
        s.send(42).await.unwrap();
        s.send(43).await.unwrap();
        assert_eq!(r2.recv().await.unwrap(), 42);
        assert_eq!(r1.recv().await.unwrap(), 43);
        s.send(42).await.unwrap();
        s.send(43).await.unwrap();
        assert_eq!(r1.recv().await.unwrap(), 42);
        assert_eq!(r2.recv().await.unwrap(), 43);
    }
}