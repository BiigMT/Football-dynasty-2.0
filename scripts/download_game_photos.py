#!/usr/bin/env python3
"""Download reviewed football stock photos into the offline app bundle."""
from pathlib import Path
from urllib.request import Request, urlopen
import json

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "media" / "game"
OUT.mkdir(parents=True, exist_ok=True)
UA = "Mozilla/5.0 (compatible; FootballDynastyOfflineMedia/1.0)"
ASSETS = [
    {"file":"matchday-training.jpg","url":"https://images.pexels.com/photos/31543189/pexels-photo-31543189.jpeg?auto=compress&cs=tinysrgb&w=1800","source":"Pexels","creator":"Franco Monsalvo","page":"https://www.pexels.com/photo/soccer-players-practicing-on-field-with-audience-31543189/","license":"Pexels License","use":"matchday, player career dashboard, news"},
    {"file":"training-ground.jpg","url":"https://images.pexels.com/photos/38615752/pexels-photo-38615752.jpeg?auto=compress&cs=tinysrgb&w=1800","source":"Pexels","creator":"Franco Monsalvo","page":"https://www.pexels.com/photo/soccer-training-session-on-outdoor-field-38615752/","license":"Pexels License","use":"training, academy, player development"},
    {"file":"team-talk.jpg","url":"https://images.pexels.com/photos/6077808/pexels-photo-6077808.jpeg?auto=compress&cs=tinysrgb&w=1800","source":"Pexels","creator":"Tima Miroshnichenko","page":"https://www.pexels.com/photo/a-coach-talking-to-his-team-6077808/","license":"Pexels License","use":"team talks, dressing room, press room"},
    {"file":"manager-tactics.jpg","url":"https://images.pexels.com/photos/13907431/pexels-photo-13907431.jpeg?auto=compress&cs=tinysrgb&w=1800","source":"Pexels","creator":"Quyn Pham","page":"https://www.pexels.com/photo/a-coach-making-a-plan-for-the-team-13907431/","license":"Pexels License","use":"manager dashboard, tactics, transfer meeting"},
    {"file":"player-action.jpg","url":"https://images.pexels.com/photos/15153169/pexels-photo-15153169.jpeg?auto=compress&cs=tinysrgb&w=1800","source":"Pexels","creator":"Hardy Pictures","page":"https://www.pexels.com/photo/football-players-playing-on-a-football-pitch-15153169/","license":"Pexels License","use":"player career, player profile feature, match reports"},
    {"file":"player-preparation.jpg","url":"https://images.pexels.com/photos/30584991/pexels-photo-30584991.jpeg?auto=compress&cs=tinysrgb&w=1800","source":"Pexels","creator":"Franco Monsalvo","page":"https://www.pexels.com/photo/soccer-player-stretching-on-field-during-training-30584991/","license":"Pexels License","use":"fitness, recovery, training"},
    {"file":"phone-stadium.jpg","url":"https://cdn.stocksnap.io/img-thumbs/960w/soccer-field_5FKA3VHPRW.jpg","source":"StockSnap","creator":"Abigail Keenan","page":"https://stocksnap.io/photo/soccer-field-5FKA3VHPRW","license":"CC0","use":"player phone wallpaper, social feed"},
    {"file":"phone-match.jpg","url":"https://images.unsplash.com/photo-1777715329839-41b5033c3003?auto=format&fit=crop&fm=jpg&q=82&w=1600","source":"Unsplash","creator":"Tanya Barrow","page":"https://unsplash.com/photos/soccer-players-warming-up-on-a-stadium-field-before-game-_xLfo1r9nGM","license":"Unsplash License","use":"player phone, fixtures and matchday stories"},
]
def download(asset):
    req=Request(asset["url"],headers={"User-Agent":UA,"Accept":"image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8","Referer":asset["page"]})
    with urlopen(req,timeout=90) as response: data=response.read()
    if len(data)<20_000 or not (data.startswith(bytes.fromhex("ffd8ff")) or data.startswith(bytes.fromhex("89504e47")) or data[:4]==b"RIFF" or (data[4:8]==b"ftyp" and data[8:12] in (b"avif",b"avis"))):
        raise RuntimeError(f"Invalid or unexpectedly small image response ({len(data)} bytes)")
    (OUT/asset["file"]).write_bytes(data)
    return {"file":asset["file"],"bytes":len(data),"source":asset["source"],"creator":asset["creator"],"page":asset["page"],"license":asset["license"],"use":asset["use"]}
def main():
    done=[]; errors=[]
    for a in ASSETS:
        try:
            item=download(a); done.append(item); print("Downloaded",item["file"],item["bytes"])
        except Exception as e:
            errors.append({"file":a["file"],"error":str(e)}); print("FAILED",a["file"],e)
    manifest={"offline":True,"assetCount":len(done),"assets":done,"errors":errors}
    (OUT/"manifest.json").write_text(json.dumps(manifest,indent=2)+"\n")
    print(json.dumps({"assetCount":len(done),"errors":errors},indent=2))
if __name__=="__main__": main()
