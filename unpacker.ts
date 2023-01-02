import * as os from 'os';
import * as sys from 'sys';
import { Image } from 'PIL';
import { ElementTree } from 'xml/etree';
import * as json from 'json';

let _pj;

let ext, files, path_or_name;

function _pj_snippets (container)
{
    function in_es6 (left, right)
    {
        if (right instanceof Array || typeof right === 'string')
        {
            return right.indexOf(left) > -1;
        }
        else
        {
            if (right instanceof Map || right instanceof Set || right instanceof WeakMap || right instanceof WeakSet)
            {
                return right.has(left);
            }
            else
            {
                return left in right;
            }
        }
    }

    container['in_es6'] = in_es6;
    return container;
}

_pj = {};

_pj_snippets(_pj);

function tree_to_dict (tree)
{
    let d, index, item;
    d = {};

    for (var i, _pj_c = 0, _pj_a = enumerate(tree), _pj_b = _pj_a.length; _pj_c < _pj_b; _pj_c += 1)
    {
        i = _pj_a[_pj_c];
        index = i[0];
        item = i[1];

        if (item.tag === 'key')
        {
            if (tree[index + 1].tag === 'string')
            {
                d[item.text] = tree[index + 1].text;
            }
            else
            {
                if (tree[index + 1].tag === 'true')
                {
                    d[item.text] = true;
                }
                else
                {
                    if (tree[index + 1].tag === 'false')
                    {
                        d[item.text] = false;
                    }
                    else
                    {
                        if (tree[index + 1].tag === 'integer')
                        {
                            d[item.text] = Number.parseInt(tree[index + 1].text);
                        }
                        else
                        {
                            if (tree[index + 1].tag === 'dict')
                            {
                                d[item.text] = tree_to_dict(tree[index + 1]);
                            }
                        }
                    }
                }
            }
        }
    }

    return d;
}

function frames_from_data (filename, ext)
{
    let d, data, data_filename, frame, frames, h, height, json_data, offset_x, offset_y, offsetlist, plist_dict, real_h, real_height, real_rectlist, real_sizelist, real_w, real_width, rectlist, root, to_list, w, width, x, y;
    data_filename = filename + ext;

    if (ext === '.plist')
    {
        root = ElementTree.fromstring(open(data_filename, 'r').read());
        plist_dict = tree_to_dict(root[0]);

        to_list = x =>
        {
            return x.replace('{', '').replace('}', '').split(',');
        };

        frames = plist_dict['frames'].items();

        for (var f, _pj_c = 0, _pj_a = frames, _pj_b = _pj_a.length; _pj_c < _pj_b; _pj_c += 1)
        {
            f = _pj_a[_pj_c];
            frame = f[1];

            if (plist_dict['metadata']['format'] === 3)
            {
                frame['frame'] = frame['textureRect'];
                frame['rotated'] = frame['textureRotated'];
                frame['sourceSize'] = frame['spriteSourceSize'];
                frame['offset'] = frame['spriteOffset'];
            }

            rectlist = to_list(frame['frame']);
            width = Number.parseInt(Number.parseFloat(frame['rotated'] ? rectlist[3] : rectlist[2]));
            height = Number.parseInt(Number.parseFloat(frame['rotated'] ? rectlist[2] : rectlist[3]));
            frame['box'] = [Number.parseInt(Number.parseFloat(rectlist[0])), Number.parseInt(Number.parseFloat(rectlist[1])), Number.parseInt(Number.parseFloat(rectlist[0])) + width, Number.parseInt(Number.parseFloat(rectlist[1])) + height];
            real_rectlist = to_list(frame['sourceSize']);
            real_width = Number.parseInt(Number.parseFloat(frame['rotated'] ? real_rectlist[1] : real_rectlist[0]));
            real_height = Number.parseInt(Number.parseFloat(frame['rotated'] ? real_rectlist[0] : real_rectlist[1]));
            real_sizelist = [real_width, real_height];
            frame['real_sizelist'] = real_sizelist;
            offsetlist = to_list(frame['offset']);
            offset_x = Number.parseInt(Number.parseFloat(frame['rotated'] ? offsetlist[1] : offsetlist[0]));
            offset_y = Number.parseInt(Number.parseFloat(frame['rotated'] ? offsetlist[0] : offsetlist[1]));

            if (frame['rotated'])
            {
                frame['result_box'] = [Number.parseInt(Number.parseFloat((real_sizelist[0] - width) / 2 + offset_x)), Number.parseInt(Number.parseFloat((real_sizelist[1] - height) / 2 + offset_y)), Number.parseInt(Number.parseFloat((real_sizelist[0] + width) / 2 + offset_x)), Number.parseInt(Number.parseFloat((real_sizelist[1] + height) / 2 + offset_y))];
            }
            else
            {
                frame['result_box'] = [Number.parseInt(Number.parseFloat((real_sizelist[0] - width) / 2 + offset_x)), Number.parseInt(Number.parseFloat((real_sizelist[1] - height) / 2 - offset_y)), Number.parseInt(Number.parseFloat((real_sizelist[0] + width) / 2 + offset_x)), Number.parseInt(Number.parseFloat((real_sizelist[1] + height) / 2 - offset_y))];
            }
        }

        return frames;
    }
    else
    {
        if (ext === '.json')
        {
            json_data = open(data_filename);
            data = json.load(json_data);
            frames = {};

            for (var f, _pj_c = 0, _pj_a = data['frames'], _pj_b = _pj_a.length; _pj_c < _pj_b; _pj_c += 1)
            {
                f = _pj_a[_pj_c];
                x = Number.parseInt(Number.parseFloat(f['frame']['x']));
                y = Number.parseInt(Number.parseFloat(f['frame']['y']));
                w = Number.parseInt(Number.parseFloat(f['rotated'] ? f['frame']['h'] : f['frame']['w']));
                h = Number.parseInt(Number.parseFloat(f['rotated'] ? f['frame']['w'] : f['frame']['h']));
                real_w = Number.parseInt(Number.parseFloat(f['rotated'] ? f['sourceSize']['h'] : f['sourceSize']['w']));
                real_h = Number.parseInt(Number.parseFloat(f['rotated'] ? f['sourceSize']['w'] : f['sourceSize']['h']));
                d = {
                    'box': [x, y, x + w, y + h],
                    'real_sizelist': [real_w, real_h],
                    'result_box': [Number.parseInt((real_w - w) / 2), Number.parseInt((real_h - h) / 2), Number.parseInt((real_w + w) / 2), Number.parseInt((real_h + h) / 2)],
                    'rotated': f['rotated']
                };
                frames[f['filename']] = d;
            }

            json_data.close();
            return frames.items();
        }
        else
        {
            console.log('Wrong data format on parsing: \'' + ext + '\'!');
            exit(1);
        }
    }
}

function gen_png_from_data (filename, ext)
{
    let big_image, box, frame, frames, k, outfile, real_sizelist, rect_on_big, result_box, result_image;
    big_image = Image.open(filename + '.png');
    frames = frames_from_data(filename, ext);

    for (var f, _pj_c = 0, _pj_a = frames, _pj_b = _pj_a.length; _pj_c < _pj_b; _pj_c += 1)
    {
        f = _pj_a[_pj_c];
        k = f[0];
        frame = f[1];
        box = frame['box'];
        rect_on_big = big_image.crop(box);
        real_sizelist = frame['real_sizelist'];
        result_image = Image.newX('RGBA', real_sizelist, [0, 0, 0, 0]);
        result_box = frame['result_box'];
        result_image.paste(rect_on_big, result_box, {
            'mask': 0
        });

        if (frame['rotated'])
        {
            result_image = result_image.transpose(Image.ROTATE_90);
        }

        if (!os.path.isdir(filename))
        {
            os.mkdir(filename);
        }

        outfile = (filename + '/' + k).replace('gift_', '');

        if (!outfile.endswith('.png'))
        {
            outfile += '.png';
        }

        console.log(outfile, 'generated');
        result_image.save(outfile);
    }
}

function end_with (s, ...endstring)
{
    let array;
    array = map(s.endswith, endstring);

    if (_pj.in_es6(true, array))
    {
        return true;
    }
    else
    {
        return false;
    }
}

// Get the all files & directories in the specified directory (path).
function get_file_list (path)
{
    let all_files, current_files, full_file_name, next_level_files;
    current_files = os.listdir(path);
    all_files = [];

    for (var file_name, _pj_c = 0, _pj_a = current_files, _pj_b = _pj_a.length; _pj_c < _pj_b; _pj_c += 1)
    {
        file_name = _pj_a[_pj_c];
        full_file_name = os.path.join(path, file_name);

        if (end_with(full_file_name, '.plist'))
        {
            full_file_name = full_file_name.replace('.plist', '');
            all_files.append(full_file_name);
        }

        if (end_with(full_file_name, '.json'))
        {
            full_file_name = full_file_name.replace('.json', '');
            all_files.append(full_file_name);
        }

        if (os.path.isdir(full_file_name))
        {
            next_level_files = get_recursive_file_list(full_file_name);
            all_files.extend(next_level_files);
        }
    }

    return all_files;
}

function get_sources_file (filename)
{
    let data_filename, png_filename;
    data_filename = filename + ext;
    png_filename = filename + '.png';

    if (os.path.exists(data_filename) && os.path.exists(png_filename))
    {
        gen_png_from_data(filename, ext);
    }
    else
    {
        console.log('Make sure you have both ' + data_filename + ' and ' + png_filename + ' files in the same directory');
    }
}

// Use like this: python unpacker.py [Image Path or Image Name(but no suffix)] [Type:plist or json]
if (__name__ === '__main__')
{
    if (sys.argv.length <= 1)
    {
        console.log('You must pass filename as the first parameter!');
        exit(1);
    }

    // filename = sys.argv[1]
    path_or_name = sys.argv[1];
    ext = '.plist';

    if (sys.argv.length < 3)
    {
        console.log('No data format passed, assuming .plist');
    }
    else
    {
        if (sys.argv[2] === 'plist')
        {
            console.log('.plist data format passed');
        }
        else
        {
            if (sys.argv[2] === 'json')
            {
                ext = '.json';
                console.log('.json data format passed');
            }
            else
            {
                console.log('Wrong data format passed \'' + sys.argv[2] + '\'!');
                exit(1);
            }
        }
    }

    // supports multiple file conversions
    if (os.path.isdir(path_or_name))
    {
        files = get_file_list(path_or_name);

        for (var file0, _pj_c = 0, _pj_a = files, _pj_b = _pj_a.length; _pj_c < _pj_b; _pj_c += 1)
        {
            file0 = _pj_a[_pj_c];
            get_sources_file(file0);
        }
    }
    else
    {
        get_sources_file(path_or_name);
    }
}
